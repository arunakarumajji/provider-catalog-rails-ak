class Api::V1::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    if resource.persisted?
      token = JwtTokenService.encode(user_id: resource.id)

      render json: {
        status: { code: 200, message: 'Signed up successfully.' },
        data: UserSerializer.new(resource).serializable_hash[:data][:attributes],
        token: token
      }, status: :ok
    else
      render json: {
        status: { message: resource.errors.full_messages.join(', ') }
      }, status: :unprocessable_entity
    end
  end
end
