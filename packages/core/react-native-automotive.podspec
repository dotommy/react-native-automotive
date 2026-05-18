require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = package['name']
  s.version      = package['version']
  s.summary      = package['description']

  s.license      = package['license']
  s.ios.deployment_target = '14.0'

  s.source       = { :path => '.' }

  s.source_files  = "ios/*.{h,m,swift}"

  s.dependency 'React-Core'
end
