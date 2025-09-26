deploy-backend:
	@echo "🚀 Deploying to AWS via Serverless Framework..."
	cd server && npx serverless deploy

	@echo "✅ Backend deployed!" 

android_aab:
	cd android && ./gradlew bundleRelease

publish_android:
	cd android && ./gradlew publishBundle

android_apk:
	cd android && ./gradlew assembleRelease

.PHONY: android_aab android_apk publish_android

ios-build:
	@bundle install
	@bundle exec fastlane ios build

ios-upload:
	@bundle install
	@bundle exec fastlane ios upload

ios-release:
	@bundle install
	@bundle exec fastlane ios release