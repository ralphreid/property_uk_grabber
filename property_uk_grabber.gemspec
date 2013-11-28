# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'property_uk_grabber/version'

Gem::Specification.new do |spec|
  spec.name          = "property_uk_grabber"
  spec.version       = PropertyUkGrabber::VERSION
  spec.authors       = ["Ralph Reid"]
  spec.email         = ["beresfordjunior@me.com"]
  spec.description   = %q{This Gem can grab property data from a URL}
  spec.summary       = %q{This Gem can grab property data from a URL}
  spec.homepage      = ""
  spec.license       = "MIT"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
  spec.add_development_dependency "rspec"
  spec.add_development_dependency "pry"


  spec.add_dependency 'nokogiri'
end
