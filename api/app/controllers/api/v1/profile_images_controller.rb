
class Api::V1::ProfileImagesController < ApplicationController
  def show
    provider = Provider.find(params[:id])
    if provider.profile_image.attached?
      redirect_to rails_blob_url(provider.profile_image)
    else
      render json: { error: 'No image attached' }, status: :not_found
    end
  end
end