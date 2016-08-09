# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'codeserver/version'

Gem::Specification.new do |spec|
  spec.name          = "codeserver"
  spec.version       = CodeServer::VERSION
  spec.authors       = ["Gavin Stark"]
  spec.email         = ["gavin@gstark.com"]

  spec.summary       = %q{Serves your local directory of code with a navigatable project tree and code formatting}
  spec.description   = %q{Serves your local directory of code with a navigatable project tree and code formatting}
  spec.homepage      = "http://gstark.com"
  spec.license       = "MIT"

  # Prevent pushing this gem to RubyGems.org by setting 'allowed_push_host', or
  # delete this section to allow pushing this gem to any host.
  if spec.respond_to?(:metadata)
    spec.metadata['allowed_push_host'] = "TODO: Set to 'http://mygemserver.com'"
  else
    raise "RubyGems 2.0 or newer is required to protect against public gem pushes."
  end

  spec.files         = `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
  spec.files         += ["lib/public/dist/bundle.js"]
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.10"
  spec.add_development_dependency "rake", "~> 10.0"
  spec.add_development_dependency "awesome_print"

  spec.add_dependency "sinatra"
  spec.add_dependency "sinatra-websocket"
  spec.add_dependency "rb-fsevent"
end
