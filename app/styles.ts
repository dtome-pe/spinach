import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Define a color palette for consistent use across the app
const COLORS = {
  background: '#f0fdf4',        // Light green background
  primary: '#16a34a',           // Primary green 
  primaryDark: '#166534',       // Dark green for text
  secondaryBg: '#dcfce7',       // Secondary background/highlight
  text: '#166534',              // Main text color (dark green)
  textLight: '#374151',         // Secondary text color (gray)
  white: '#ffffff',
  buttonBackground: 'rgba(22, 163, 74, 0.1)', // Transparent green for buttons
  shadow: '#000000',            // Shadow color
};

// Define consistent font sizes
const FONTS = {
  title: 28,
  subtitle: 24,
  medium: 18,
  body: 16,
  small: 14,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.05,
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
    marginLeft: width * 0.02,
  },
  logoText: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  logoUnderline: {
    width: width * 0.15,
    height: height * 0.005,
    backgroundColor: COLORS.primary,
    marginTop: height * 0.005,
    borderRadius: 2,
  },
  tagline: {
    fontSize: width * 0.045,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: height * 0.05,
    paddingHorizontal: width * 0.05,
  },
  taglineHighlight: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  spinButtonContainer: {
    position: 'relative',
    width: Math.min(width * 0.5, height * 0.3),
    height: Math.min(width * 0.5, height * 0.3),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: height * 0.05,
  },
  decorativeCircleOuter: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: Math.min(width * 0.25, height * 0.15),
    borderWidth: 2,
    borderColor: COLORS.primary,
    opacity: 0.7,
  },
  decorativeCircleInner: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: Math.min(width * 0.2, height * 0.12),
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
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
    borderRadius: Math.min(width * 0.25, height * 0.15),
    backgroundColor: COLORS.primary,
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
    color: COLORS.white,
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginLeft: width * 0.01,
  },
  footerText: {
    fontSize: width * 0.035,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: height * 0.05,
    marginBottom: height * 0.05,
    paddingHorizontal: width * 0.05,
  },
  settingsButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? height * 0.05 : height * 0.03,
    right: width * 0.05,
    padding: width * 0.03,
    backgroundColor: COLORS.buttonBackground,
    borderRadius: width * 0.05,
    zIndex: 999,
    ...Platform.select({
      android: {
        elevation: 5,
      },
    }),
  },
  favoritesButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? height * 0.05 : height * 0.03,
    left: width * 0.05,
    padding: width * 0.03,
    backgroundColor: COLORS.buttonBackground,
    borderRadius: width * 0.05,
    zIndex: 999,
    ...Platform.select({
      android: {
        elevation: 5,
      },
    }),
  },
  homeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? height * 0.05 : height * 0.03,
    left: width * 0.05,
    padding: width * 0.03,
    backgroundColor: COLORS.buttonBackground,
    borderRadius: width * 0.05,
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
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondaryBg,
  },
  settingsHeaderTitle: {
    fontSize: FONTS.subtitle,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 10,
  },
  backButton: {
    padding: 5,
  },
  settingsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsTitle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  settingLabel: {
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  numberInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberButton: {
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButtonText: {
    color: COLORS.white,
    fontSize: FONTS.medium,
    fontWeight: 'bold',
  },
  numberValue: {
    fontSize: FONTS.body,
    color: COLORS.text,
    marginHorizontal: 15,
    minWidth: 30,
    textAlign: 'center',
  },
  recipeCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    margin: 16,
    padding: 16,
    elevation: 4,
    shadowColor: COLORS.shadow,
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
    fontSize: FONTS.subtitle,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  recipeTitle: {
    fontSize: FONTS.subtitle,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
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
    fontSize: FONTS.small,
    color: COLORS.primary,
  },
  // Recipe detail description
  recipeDetailDescription: {
    fontSize: FONTS.body,
    color: COLORS.textLight,
    lineHeight: 24,
  },
  ingredientsContainer: {
    gap: 8,
  },
  ingredientsTitle: {
    fontSize: FONTS.subtitle,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  ingredient: {
    fontSize: FONTS.body,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  ecoTipContainer: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  ecoTipTitle: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  ecoTipText: {
    fontSize: FONTS.small,
    color: COLORS.primary,
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
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  allergenButtonExclude: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  recipeRevealContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  recipeImage: {
    width: '100%',
    height: 300,
  },
  recipeContent: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  // Recipe card description
  recipeDescription: {
    fontSize: FONTS.body,
    color: COLORS.text,
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
    backgroundColor: COLORS.primary,
    marginRight: 12,
  },
  cookButton: {
    backgroundColor: COLORS.primaryDark,
    marginLeft: 12,
  },
  recipeButtonText: {
    color: COLORS.white,
    fontSize: FONTS.medium,
    fontWeight: 'bold',
  },
});

export default styles;