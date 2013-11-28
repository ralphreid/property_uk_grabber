require 'rspec'
require 'pry'
require "property_uk_grabber"



describe PropertyUkGrabber do

  before(:each) do
    path  = File.expand_path("../anscombes.html", __FILE__)
    @property = PropertyUkGrabber.get_property(path)
  end

  it "gets price" do
    @property.price.should == 99_999
  end


  it "should return html when try to fetch page" 
end