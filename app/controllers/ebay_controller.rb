# frozen_string_literal: true

class EbayAdPlugin::EbayController < ::ApplicationController

    def get_system_posts_in_topic(topic_id)
        system_user_id = User.find_by(username: 'system').id
        posts = Post.where(user_id: system_user_id, topic_id: topic_id)
        posts
      end
      
    def ad_data

        if ! SiteSetting.ebay_topic_id.empty?
            posts = get_system_posts_in_topic(SiteSetting.ebay_topic_id.to_i)
            target_post = posts.sample

            if ! target_post.nil?

                lines = target_post.raw.split("\n")
                ebay_data = {}
                lines.each do |line|
                    key, value = line.split(": ", 2)
                    ebay_data[key] = value
                end

                render json: ebay_data
            else
                render json: { id: nil }  
            end  
        else
            render json: { id: nil }
        end
    end
end