function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

const client = new Paho.Client('node.local', 1884, "dash" + parseInt(Math.random() * 1000))

const setScreenSelected = async function(sel) {
  const selected = await browser.tabs.query({active: true})
  await browser.tabs.executeScript(selected[0].id, {
    code: `document.body.style.border = '${sel ? '5px solid red' : ''}'`,
  })
}

client.onConnectionLost = (err) => {
  if (err.errorCode !== 0) {
    console.log("onConnectionLost:"+err.errorMessage)
  }
}

let current_screen = 1
browser.storage.local.get('screen').then(({ screen }) => setScreenSelected(screen == current_screen))

client.onMessageArrived = async (msg) => {
  let data, mqtt_event = {}
  const inputRegexp = /([a-z_]+)=([0-9a-z_]+)/g
  while (data = inputRegexp.exec(msg.payloadString)) {
    const v = data[2]
    mqtt_event[data[1]] = isNumeric(v) ? parseFloat(v) : v
  }
  console.log('apply_mqtt_event', mqtt_event)

  const { screen } = await browser.storage.local.get('screen')
  if (mqtt_event.evt == 'prog_change') {
    current_screen = mqtt_event.id
    setScreenSelected(screen == current_screen)
    return
  }

  if (current_screen != screen) {
    return
  }

  if (mqtt_event.evt == 'down' && mqtt_event.id < 5) {
    const k = `tab${mqtt_event.id}`
    const url = await browser.storage.local.get(k)
    if (!url || !url[k]) return
    const selected = await browser.tabs.query({active: true})
    await browser.tabs.executeScript(selected[0].id, {
      code: `window.location.href = '${url[k]}'`,
    })
  }
}

client.connect({onSuccess: () => {
  console.log('client.onSuccess')
  client.subscribe('akai', 2)
}})
