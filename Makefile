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