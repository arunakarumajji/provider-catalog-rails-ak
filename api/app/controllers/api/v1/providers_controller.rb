class Api::V1::ProvidersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_provider, only: [:show, :update, :destroy]

  # GET /api/v1/providers
  def index
    page = params[:page] || 1
    per_page = params[:per_page] || 5

    @providers = Provider.active.order(created_at: :desc)
    @providers = @providers.by_specialty(params[:specialty]) if params[:specialty].present?
    @providers = @providers.by_location(params[:location]) if params[:location].present?

    @providers = @providers.page(page).per(per_page)

    meta = {
      current_page: @providers.current_page,
      total_pages: @providers.total_pages,
      total_count: @providers.total_count
    }
    Rails.logger.info("meta-  #{@providers.total_pages}")

    render json: {
      data: ProviderSerializer.new(@providers).serializable_hash[:data],
      meta: meta
    }
  end

  # GET /api/v1/providers/:id
  def show
    render json: ProviderSerializer.new(@provider).serializable_hash
  end

  # POST /api/v1/providers
  def create
    @provider = Provider.new(provider_params)
    @provider.active = true

    if @provider.save
      render json: ProviderSerializer.new(@provider).serializable_hash, status: :created
    else
      errors = {}
      @provider.errors.each do |error|
        field = error.attribute
        message = error.message
        errors[field] = message
      end
      render json: { errors: errors }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/providers/:id
  def update
    if @provider.update(provider_params)
      render json: ProviderSerializer.new(@provider).serializable_hash
    else
      errors = {}
      # Log the raw errors to see what they look like
      Rails.logger.info("Provider errors: #{@provider.errors.inspect}")
      @provider.errors.each do |error|
        field = error.attribute
        message = error.message
        errors[field] = message
      end
      Rails.logger.info("Formatted errors: #{errors.inspect}")
      render json: { errors: errors }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/providers/:id
  def destroy
    # Soft delete (deactivate)
    if @provider.update(active: false)
      render json: { message: 'Provider deactivated successfully' }
    else
      render json: { errors: @provider.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_provider
    @provider = Provider.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Provider not found' }, status: :not_found
  end

  def provider_params
    params.require(:provider).permit(
      :npi, :first_name, :last_name, :specialty, :credentials,
      :address_line1, :address_line2, :city, :state, :zip,
      :phone, :email, :profile_image
    )
  end
end
