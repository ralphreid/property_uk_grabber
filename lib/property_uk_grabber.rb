require 'property_uk_grabber/version'
require 'nokogiri'
require 'open-uri'

module PropertyUkGrabber

  class Property

    def initialize(url)
      @page = Nokogiri::HTML(open_url(url))
    end

    def open_url url
      open(url)
    end

    def price
      @price ||= get_price
    end

  private

    def get_price
      @page.css(".title-product .price").inner_text.strip
    end

  end

  def self.get_property(url)
    Property.new(url)
  end

end