module JwtTokenService
  def self.encode(user)
    user_id = user.is_a?(Hash) ? user[:user_id] : user.id
    payload = {
      user_id: user_id,
      exp: (Time.now + 30.minutes).to_i,
      jti: SecureRandom.uuid
    }
    JWT.encode(payload, Rails.application.secret_key_base)
  end

  def self.decode(token)
    decoded_token = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')
    decoded_token.first  # Returns the payload
  rescue JWT::DecodeError
    nil
  end
end