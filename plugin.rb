# frozen_string_literal: true

# name: discourse-ebay-ads
# version: 1.0.0
# authors: ScottMastro
# url: https://github.com/ScottMastro/discourse-ebay-ads
# required_version: 2.7.0
# transpile_js: true

enabled_site_setting :enable_ebay_ads

register_asset 'stylesheets/common/common.scss'
#register_asset 'stylesheets/mobile/mobile.scss', :mobile

after_initialize do

  module ::EbayAdPlugin
    PLUGIN_NAME = "ebay-ads"
  end

  class EbayAdPlugin::Engine < ::Rails::Engine
    engine_name EbayAdPlugin::PLUGIN_NAME
    isolate_namespace EbayAdPlugin
  end

  require_relative 'app/controllers/ebay_controller.rb'
  require_relative 'lib/ebay_scraper.rb'
  require_relative 'lib/ebay_api.rb'


  EbayAdPlugin::Engine.routes.draw do
    get '/ebay' => 'ebay#ad_data'
  end
  
  Discourse::Application.routes.append do
    mount EbayAdPlugin::Engine, at: "/"
  end


  def create_system_post(topic_id, post_content)
    user = Discourse.system_user
    PostCreator.new(user,
      topic_id: topic_id,
      raw: post_content
    ).create!
  end

  def extract_ebay_urls(text)
    text.scan(/https?:\/\/(?:www\.)?ebay\.[a-z\.]{2,6}(?:\/\S*)?/i)
  end

  DiscourseEvent.on(:post_created) do |post, opts, user|

    if ! SiteSetting.ebay_topic_id.empty? && user.id != Discourse.system_user.id
      tid = SiteSetting.ebay_topic_id.to_i
      begin
        if post.topic_id == tid
          #result = EbayAdPlugin::EbayScraper::scrape_ebay(post.raw)
          ebay_item = EbayAdPlugin::EbayAPI::get_ebay_item("110554250997")
          
          post_reply = "id: " + ebay_item["itemId"] + "\n"
          puts post_reply
          post_reply = post_reply + "title: " + ebay_item["title"] + "\n"
          puts post_reply

          
          post_reply = post_reply + "price: " + ebay_item["price"]["value"] + "\n"
          puts post_reply

          post_reply = post_reply + "image_url: " + ebay_item["image"]["imageUrl"] + "\n"
          puts post_reply
          post_reply = post_reply + "seller_id: " + ebay_item["seller"]["username"] + "\n"
          puts post_reply
          post_reply = post_reply + "feedback_number: " + ebay_item["seller"]["feedbackScore"].to_s
          puts post_reply


          create_system_post(tid, post_reply)
        end
      rescue => e
        create_system_post(tid, "Error: "+e.message)
      end
    end
  end

end