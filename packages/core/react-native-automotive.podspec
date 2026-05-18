require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = package['name']
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = 'https://github.com/dotommy/react-native-automotive'
  s.license      = package['license']
  s.authors      = 'dotommy'
  s.ios.deployment_target = '14.0'
  s.swift_version = '5.0'

  # Source URL is required by the CocoaPods validator even for local-path
  # consumption. When publishing to npm, React Native autolinking uses
  # `:path => '../node_modules/react-native-automotive'` at the consumer
  # side, overriding this URL — so the tag does not need to exist yet.
  s.source       = { :git => 'https://github.com/dotommy/react-native-automotive.git', :tag => "v#{s.version}" }

  s.source_files  = "ios/*.{h,m,swift}"

  # Swift interop with Objective-C (React Native + CarPlay headers).
  # DEFINES_MODULE generates the modulemap that exposes Swift classes
  # back to Objective-C via the auto-generated `<PodName>-Swift.h` umbrella.
  s.pod_target_xcconfig = {
    'SWIFT_OBJC_BRIDGING_HEADER' => '${PODS_TARGET_SRCROOT}/ios/RNAutomotive-Bridging-Header.h',
    'DEFINES_MODULE' => 'YES',
    'CLANG_ENABLE_MODULES' => 'YES'
  }

  s.dependency 'React-Core'
end
