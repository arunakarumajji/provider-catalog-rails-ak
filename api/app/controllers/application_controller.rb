class ApplicationController < ActionController::API

  attr_reader :current_user


  def authenticate_user!
    token = request.headers['Authorization']&.split(' ')&.last
    decoded_token = JwtTokenService.decode(token)

    if decoded_token
      @current_user = User.find(decoded_token['user_id'])
    else
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  rescue JWT::ExpiredSignature, JWT::DecodeError
    render json: { error: 'Token has expired or is invalid' }, status: :unauthorized
  end
end
