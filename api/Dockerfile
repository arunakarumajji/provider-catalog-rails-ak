FROM ruby:3.2.2-slim-bookworm AS base

WORKDIR /test_api

# Install library depdencies for Ruby on Rails
RUN apt-get update && apt-get install -y make gcc build-essential libpq-dev nodejs

ENV BUNDLE_PATH=/usr/local/bundle

RUN gem install bundler

RUN gem install rails

CMD ["rails", "new", ".", "--skip", "--skip-git", "--skip-test", "--api", "--database=postgresql"]

FROM base AS development

# Copy the entire application directory
COPY . .

# Install Ruby gems for development build
RUN bundle install

# Expose default Rails port
EXPOSE 3000

# Execute rails server in development mode
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]