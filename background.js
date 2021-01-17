function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

async function get(keys) {
  return await new Promise(r => chrome.storage.local.get(keys, r))
}

async function query(params) {
  return await new Promise(r => chrome.tabs.query(params, r))
}

async function executeScript(tabId, details) {
  return await new Promise(r => chrome.tabs.executeScript(tabId, details, r))
}

(async function() {

  const { mqtt_server, mqtt_server_port } = await get(['mqtt_server', 'mqtt_server_port'])
  const client = new Paho.Client(`${mqtt_server}:${parseInt(mqtt_server_port)}/`, "dash" + parseInt(Math.random() * 1000))

  const setScreenSelected = async function(sel) {
    const selected = await query({active: true})
    await executeScript(selected[0].id, {
      code: `document.body.style.border = '${sel ? '5px solid red' : ''}'`,
    })
  }

  client.onConnectionLost = (err) => {
    if (err.errorCode !== 0) {
      console.log("onConnectionLost:"+err.errorMessage)
    }
  }

  let current_screen = 1
  setScreenSelected(await get('screen') == current_screen)

  client.onMessageArrived = async (msg) => {
    let data, mqtt_event = {}
    const inputRegexp = /([a-z_]+)=([0-9a-z_]+)/g
    while (data = inputRegexp.exec(msg.payloadString)) {
      const v = data[2]
      mqtt_event[data[1]] = isNumeric(v) ? parseFloat(v) : v
    }
    console.log('apply_mqtt_event', mqtt_event)

    const { screen } = await get('screen')
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
      const url = await get(k)
      if (!url || !url[k]) return
      const selected = await query({active: true})
      await chrome.tabs.executeScript(selected[0].id, {
        code: `window.location.href = '${url[k]}'`,
      })
    }
  }

  client.connect({onSuccess: () => {
    console.log('client.onSuccess')
    client.subscribe('akai', 2)
  }})
})()
