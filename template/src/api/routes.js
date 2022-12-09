const util = require('util');
const { Router } = require('express');
const { pathParser } = require('../lib/path');
const { yellow } = require('../lib/colors');
{%- for channelName, channel in asyncapi.channels() -%}
{% set allOperationIds = channel | getOperationIds %}
const { {{ allOperationIds }} } = require('./services/{{ channelName | kebabCase }}');
{%- endfor %}
const router = Router();
module.exports = router;


let connections=[];
let connectionIds=[];

{% for channelName, channel in asyncapi.channels() -%}
router.ws('{{channelName | pathResolve}}', async (ws, req) => {
  ws.id = req.headers['sec-websocket-key'];
  connectionIds.push(ws.id)
  connections.push(ws)
  const path = pathParser(req.path);
  console.log(`${yellow(path)} client connected.${ws.id}`);
  connections.forEach( async con=>{
    {%- if channel.hasSubscribe() %}
    await {{ channel.subscribe().id() }}(con,JSON.stringify({"connections":connectionIds}));
    {%- endif %}
  })

  {%- if channel.hasPublish() %}
  ws.on('message', async (msg) => {
    connections.forEach( async con=>{
      if(con.id!==ws.id){
        await {{ channel.publish().id() }}(con, { message: msg, path, query: req.query });
        console.log(util.inspect(msg, { depth: null, colors: true }));
      }
    })
  });
  {%- endif %}

  {%- if channel.hasPublish() %}
  ws.on('close',async () => {
    connections=connections.filter((con)=>con.id!==ws.id)
    connectionIds=connectionIds.filter((con)=>con!==ws.id)
    connections.forEach( async con=>{
      await {{ channel.subscribe().id() }}(con,JSON.stringify({"disconnections":ws?.id}));
      console.log(util.inspect(JSON.stringify({"disconnection":ws.id}), { depth: null, colors: true }));
    })
  })
  {%- endif %}
});
{% endfor -%}

