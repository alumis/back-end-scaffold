import { SPA } from "@alumis/spa";
import { IndexPage } from "../pages/IndexPage";
import { languages } from "@alumis/observables-i18n";

import { currentDeviceWidth } from "@alumis/theme";

import "../scss/_reboot.scss";

class MyApp extends SPA {
    constructor() {
        super(new IndexPage());
        currentDeviceWidth.subscribeInvoke(n => { console.log(n); })
    }
}

new MyApp().invalidateLocationAsync();

console.log(IS_DEV); //// "test", { "no": "dette er en test", "en": "this is a test" }
console.log(IS_PROD);
console.log(VER);

console.log(languages);