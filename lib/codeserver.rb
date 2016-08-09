require "codeserver/version"
require 'sinatra'
require 'sinatra-websocket'
require 'rb-fsevent'
require 'awesome_print' if development?

require 'find'
require 'erb'
require 'json'
require 'date'
require 'open3'

require_relative 'file_extensions'
require_relative 'tree'

module CodeServer
  class SinatraApp < Sinatra::Base
    DEFAULT_OPTIONS = { directory: ".", binding: "0.0.0.0", port: 4242 }

    def self.setup!(options = DEFAULT_OPTIONS)
      Sinatra::Base.set(:port, options[:port])
      Sinatra::Base.set(:bind, options[:binding])
      Sinatra::Base.set(:show_exceptions, false)
    end

    set :public_folder, File.expand_path(File.join(File.dirname(__FILE__), "public"))

    Tilt.register Tilt::ERBTemplate, 'html.erb'

    get '/' do
      erb :index
    end

    get '/file' do
      @path = params[:path]

      erb :index
    end

    get '/directory.json' do
      tree = Tree.new(settings.root_path)

      content_type :json

      tree.directory_structure.to_json
    end

    get '/code' do
      send_file File.safe_join(settings.root_path, params[:file]).tr(";", "")
    end

    get '/updates' do
      tree    = Tree.new(settings.root_path)
      fsevent = FSEvent.new

      request.websocket do |websocket|
        websocket.onopen do
          fsevent.watch(settings.root_path) do |change|
            websocket.send(({ tree: tree.directory_structure }.to_json))
          end

          fsevent.watch(settings.root_path, file_events: true) do |changes|
            changes.select { |change| File.file?(change) }.each do |change|
              content = File.read(change)
              path = change.gsub(settings.root_path) { "." }
              websocket.send(({ content: content, path: path }.to_json))
            end
            websocket.send(({ tree: tree.directory_structure }.to_json))
          end
          fsevent.run
        end
      end
    end

    error do
      "ooops"
    end
  end
end
