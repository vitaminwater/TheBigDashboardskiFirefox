
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const client = new Paho.Client('node.local', 1884, "dash" + parseInt(Math.random() * 1000));

client.onConnectionLost = (err) => {
  if (err.errorCode !== 0) {
    console.log("onConnectionLost:"+err.errorMessage);
  }
}

client.onMessageArrived = async (msg) => {
  let data, mqtt_event = {}
  const inputRegexp = /([a-z_]+)=([0-9a-z_]+)/g
  while (data = inputRegexp.exec(msg.payloadString)) {
    const v = data[2]
    mqtt_event[data[1]] = isNumeric(v) ? parseFloat(v) : v
  }
  console.log('apply_mqtt_event', mqtt_event)
  const selected = await browser.tabs.query({active: true})
  await browser.tabs.executeScript(selected[0].id, {
    code: `window.location.href = 'http://google.fr'`,
  });
}

client.connect({onSuccess: () => {
  console.log('client.onSuccess')
  client.subscribe('akai', 2)
}});
