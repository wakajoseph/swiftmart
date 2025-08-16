

class SettingsModel {
  constructor() {
    this.els = {};
    this.settingsContainer = document.querySelector(".settings-container.view");
    this.init();
  }
  
  sel(s, cont=null) {
    if (cont) {
      return cont.querySelector(s) || null;
    }    
    return document.querySelector(s) || s;
  }
  
  init() {
    let c = this.settingsContainer;
    this.els = {
     navivateSettings: this.sel(".navsetting"),
       
    }
    this.addEvents();      
  }
  
  addEvents() {
     this.els.navivateSettings.addEventListener('click', ()=> navigateTo("settings"));
  }
}

new SettingsModel();