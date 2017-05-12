
const Promise = require('bluebird');
const HydraPlugin = require('hydra/plugin');
const RECONFIGURE_EVENT = 'reconfigure';
exports.RECONFIGURE_EVENT = RECONFIGURE_EVENT;
class Reconfigurable extends HydraPlugin {
  constructor() {
    super('reconfigurable'); // unique identifier for the plugin
  }

  setConfig(hydraConfig) {
    super.setConfig(hydraConfig);

    if (!process.env.HYDRA_SERVICE || !process.env.HYDRA_REDIS_URL) {
      this.hydra.sendToHealthLog('info', `[reconfigurable] No HYDRA_SERVICE or HYDRA_REDIS_URL env configured. No config changes listen configured.`);
      return;
    }

    this.hydra.sendToHealthLog('info', `[reconfigurable] Listen for config change on label ${process.env.HYDRA_SERVICE}`);
    this.registerReconfigureListener();
  }

  registerReconfigureListener() {
    this.hydra.on('message', (message) => {
      if (message.typ === RECONFIGURE_EVENT) {
        if (process.env.HYDRA_SERVICE === message.bdy.label) {
          hydra.getConfig(label).then((newConfig) => {
            this.hydra.sendToHealthLog('debug', `[reconfigurable] Config changes detected. Emit '${RECONFIGURE_EVENT}' event.`);
            hydra.emit(RECONFIGURE_EVENT, label, newConfig);
          });
        }
      }
    });
  }
}

module.exports = Reconfigurable;
