require 'pathname'

class File
  TraversalException = Class.new(StandardError)

  # Returns a String containing the path to the specified file with the
  # guarantee that the resulting file path is a subdirectory of the source
  # path.  This avoids tricks like specifiying "../../../../../../etc/passwd"
  # in the filename part
  def self.safe_join(root_path, *segments)
    clean_path = Pathname(root_path).cleanpath

    new_path = clean_path
    Array(segments).each { |segment| new_path += segment.to_s }

    new_path.ascend { |path| return new_path.to_s if (path == clean_path) }

    raise TraversalException
  end
end
