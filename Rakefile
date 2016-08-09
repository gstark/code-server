require "bundler/gem_tasks"
require 'codeserver'
require 'sinatra'

file 'lib/public/dist/bundle.js' => FileList['lib/public/assets/**'] do
  puts "Webpack"
  %x{cd lib; webpack}
end

task :build => 'lib/public/dist/bundle.js'

desc "devserver"
task :devserver do
  CodeServer::SinatraApp.setup!

  CodeServer::SinatraApp.run!(root_path: File.expand_path("."))
end

