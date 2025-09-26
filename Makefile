deploy-backend:
	@echo "🚀 Deploying to AWS via Serverless Framework..."
	cd server && npx serverless deploy

	@echo "✅ Backend deployed!" 

ios-build:
	@bundle install
	@bundle exec fastlane ios build

ios-upload:
	@bundle install
	@bundle exec fastlane ios upload

ios-release:
	@bundle install
	@bundle exec fastlane ios release