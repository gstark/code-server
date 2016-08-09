require 'json'

module CodeServer
  class Tree
    attr_accessor :root_path

    def initialize(root_path)
      self.root_path = root_path
    end

    def directory_structure
      if %x{git rev-parse 2>&1}.empty?
        data = %x{cd #{root_path}; git ls-files 2>/dev/null; git ls-files --exclude-standard --others 2>/dev/null}.split("\n")
      else
        data = %x{cd #{root_path}; find . | cut -c3-}
      end

      tree = { files: [], directories: [] }
      data.each do |line|
        current_tree = tree

        *directories, file = line.split("/")

        path = "."
        while directory = directories.shift do
          path << "/#{directory}"

          subdirectory = current_tree[:directories].find { |entry| entry[:name] == directory }
          if subdirectory.nil?
            subdirectory = { name: directory, path: path, directories: [], files: [] }
            current_tree[:directories] << subdirectory
          end

          current_tree = subdirectory
        end

        current_tree[:files] << { name: file, path: "./#{line}" }
      end

      tree
    end
  end
end

if $0 == __FILE__
  puts CodeServer::Tree.new("..").directory_structure.to_json
end
