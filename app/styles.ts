import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.05,
    marginTop: height * 0.1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTextContainer: {
    marginLeft: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  logoUnderline: {
    width: 60,
    height: 4,
    backgroundColor: '#16a34a',
    marginTop: 4,
    borderRadius: 2,
  },
  tagline: {
    fontSize: 18,
    color: '#166534',
    textAlign: 'center',
    marginBottom: height * 0.05,
  },
  taglineHighlight: {
    fontWeight: 'bold',
    color: '#16a34a',
  },
  spinButtonContainer: {
    position: 'relative',
    width: Math.min(width * 0.5, 200),
    height: Math.min(width * 0.5, 200),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  decorativeCircleOuter: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#16a34a',
    opacity: 0.7,
  },
  decorativeCircleInner: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#166534',
    opacity: 1,
  },
  spinButtonWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinButton: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinButtonSvg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  spinTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
    marginTop: height * 0.05,
    marginBottom: height * 0.05,
  },
  settingsButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderRadius: 20,
    zIndex: 999,
    ...Platform.select({
      android: {
        elevation: 5,
      },
    }),
  },
  favoritesButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderRadius: 20,
    zIndex: 999,
    ...Platform.select({
      android: {
        elevation: 5,
      },
    }),
  },
  homeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderRadius: 20,
    zIndex: 999,
    ...Platform.select({
      android: {
        elevation: 5,
      },
    }),
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
  },
  settingsHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#166534',
    marginLeft: 10,
  },
  backButton: {
    padding: 5,
  },
  settingsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0fdf4',
  },
  settingLabel: {
    fontSize: 16,
    color: '#166534',
  },
  numberInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberButton: {
    backgroundColor: '#16a34a',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  numberValue: {
    fontSize: 16,
    color: '#166534',
    marginHorizontal: 15,
    minWidth: 30,
    textAlign: 'center',
  },
  recipeCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipeTitleHighlight: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
  },
  recipeMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeMetaText: {
    fontSize: 14,
    color: '#16a34a',
  },
  recipeDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  ingredientsContainer: {
    gap: 8,
  },
  ingredientsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 8,
  },
  ingredient: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  ecoTipContainer: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  ecoTipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 4,
  },
  ecoTipText: {
    fontSize: 14,
    color: '#15803d',
    lineHeight: 20,
  },
  allergenLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allergenIcon: {
    marginRight: 8,
  },
  allergenButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  allergenButtonInclude: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  allergenButtonExclude: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  recipeRevealContainer: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  recipeImage: {
    width: '100%',
    height: 300,
  },
  recipeContent: {
    padding: 24,
    alignItems: 'center',
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#166534',
    textAlign: 'center',
  },
  recipeDescription: {
    fontSize: 16,
    color: '#166534',
    textAlign: 'center',
    marginTop: 8,
  },
  recipeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginTop: 24,
  },
  recipeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    flex: 1,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#16a34a',
    marginRight: 12,
  },
  cookButton: {
    backgroundColor: '#166534',
    marginLeft: 12,
  },
  recipeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default styles;