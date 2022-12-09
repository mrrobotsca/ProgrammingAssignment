const service = module.exports = {};
{% if channel.hasSubscribe() %}
/**
 * {{ channel.subscribe().summary() }}
 * @param {object} ws WebSocket connection.
 * @param {string} msg The message that was received.
 */
service.{{ channel.subscribe().id() }} = async (ws,msg) => {
  ws.send(msg);
};

{%- endif %}
{%- if channel.hasPublish() %}
/**
 * {{ channel.publish().summary() }}
 * @param {object} ws WebSocket connection.
 * @param {object} options
 * @param {%raw%}{{%endraw%}{{channel.publish().message(0).payload().type()}}{%raw%}}{%endraw%} options.message The received message.
{%- if channel.publish().message(0).headers() %}
{%- for fieldName, field in channel.publish().message(0).headers().properties() %}
{{ field | docline(fieldName, 'options.message.headers') }}
{%- endfor %}
{%- endif %}
{%- if channel.publish().message(0).payload() %}
{%- for fieldName, field in channel.publish().message(0).payload().properties() %}
{{ field | docline(fieldName, 'options.message.payload') }}
{%- endfor %}
{%- endif %}
 */
service.{{ channel.publish().id() }} = async (ws, { message}) => {
  if(message){
    ws.send(message);
  }
};

{%- endif %}
