const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = {

    generateHTML: async function (callback, html) {

        try {

            const dom = new JSDOM(html, {
                url: "http://localhost:5000/",
                contentType: "text/html",
                includeNodeLocations: true,
                storageQuota: 10000000,
                runScripts: "dangerously",
                resources: "usable"
            });

            dom.window.onload = () => {

                console.log(dom.serialize());

                callback(null, dom.serialize() || "faen");
            };
        }

        catch (e) {

            callback(e);
            return;
        }
    }
};