class Api::V1::SessionsController < Devise::SessionsController
  respond_to :json
  before_action :set_devise_mapping
  # skip_forgery_protection
  # skip_before_action :verify_authenticity_token, if: :json_request?

  def create
    # Skip Devise's default behavior that tries to use flash messages.. Its causing issues for rspec testing
    self.resource = warden.authenticate!(auth_options)
    sign_in(resource_name, resource)
    respond_with(resource)
  end

  private

  def set_devise_mapping
    @devise_mapping = Devise.mappings[:user]
    request.env["devise.mapping"] = @devise_mapping
  end

  def json_request?
    request.format.json?
  end

  def respond_with(resource, _opts = {})
    # Generate JWT token
    token = JwtTokenService.encode(user_id: resource.id)

    render json: {
      status: { code: 200, message: 'Logged in successfully.' },
      data: UserSerializer.new(resource).serializable_hash[:data][:attributes],
      token: token
    }, status: :ok
  end

  def respond_to_on_destroy
    if current_user
      render json: {
        status: 200,
        message: 'Logged out successfully.'
      }, status: :ok
    else
      render json: {
        status: 401,
        message: 'Couldn\'t find an active session.'
      }, status: :unauthorized
    end
  end
end