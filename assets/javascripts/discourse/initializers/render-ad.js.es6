import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from 'discourse/lib/ajax';
import { popupAjaxError } from "discourse/lib/ajax-error";

export default {
  name: "initialize-ebay-ad-plugin",
  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");
    if (siteSettings.enable_ebay_ads) {
      withPluginApi("0.1", (api) => generateAd(api, siteSettings));
    }
  },
};

function generateAd(api, siteSettings) {
  api.registerConnectorClass('above-main-container', 'ebay-ad', {
    setupComponent(attrs, component) {

    ajax("/ebay.json")
    .then((result) => {
      
      if (result.id == null){
        component.setProperties({"valid": false});
      }
      else{
        component.setProperties({
          "valid" : true,
          "title": result.title,
          "price":result.price,
          "image_url":result.image_url,
          "seller_id": result.seller_id,
          "feedback_number": result.feedback_number});
      }
    
    }).catch(popupAjaxError);
    },
  });
}