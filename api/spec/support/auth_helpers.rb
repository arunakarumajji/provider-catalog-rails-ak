# spec/support/auth_helpers.rb
module AuthHelpers
  def auth_headers(user)
    token = JwtTokenService.encode(user)
    { 'Authorization' => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :controller
  config.include AuthHelpers, type: :request
end