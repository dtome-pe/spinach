deploy-backend:
	@echo "🚀 Deploying to AWS via Serverless Framework..."
	cd server && npx serverless deploy

	@echo "✅ Backend deployed!" 