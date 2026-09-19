const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/nayan/OneDrive/Desktop/Y3S1/Personal projects/CareMate/CareMateApp/Frontend/src/screens';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix merged imports
  content = content.replace(/StyleSheetImage/g, 'StyleSheet, Image');
  content = content.replace(/StyleSheetTextInput/g, 'StyleSheet, TextInput');
  content = content.replace(/StyleSheetTouchableOpacity/g, 'StyleSheet, TouchableOpacity');
  content = content.replace(/StyleSheetScrollView/g, 'StyleSheet, ScrollView');
  content = content.replace(/StyleSheetKeyboardAvoidingView/g, 'StyleSheet, KeyboardAvoidingView');
  content = content.replace(/StyleSheetFlatList/g, 'StyleSheet, FlatList');
  content = content.replace(/StyleSheetAnimated/g, 'StyleSheet, Animated');
  content = content.replace(/StyleSheetActivityIndicator/g, 'StyleSheet, ActivityIndicator');
  content = content.replace(/StyleSheetAlert/g, 'StyleSheet, Alert');
  content = content.replace(/StyleSheetModal/g, 'StyleSheet, Modal');
  content = content.replace(/StyleSheetPlatform/g, 'StyleSheet, Platform');
  
  // Look for any other StyleSheet merged imports
  content = content.replace(/StyleSheet([A-Z][a-zA-Z]+)/g, 'StyleSheet, $1');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log('Repaired ' + file);
  }
}
