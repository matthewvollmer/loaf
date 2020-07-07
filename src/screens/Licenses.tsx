import React from 'react';
import { StyleSheet, View, Text, Linking } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

type Props = {
  };

interface State {
}

class Licenses extends React.Component<Props, State> { 
    constructor(props: Readonly<Props>) {
      super(props);

      this.state = {
      }
  }

    public render() {
        return (
          <ScrollView >
            <Text style={{alignSelf: 'center', fontSize: 20}}>Privacy Policy:</Text>
            <Text style={{alignSelf: 'center', fontSize: 12, color: 'blue', textDecorationLine:'underline'}}
              onPress={() => Linking.openURL('https://loaf.flycricket.io/privacy.html')}>
              https://loaf.flycricket.io/privacy.html
            </Text>

            <Text style={{alignSelf: 'center', fontSize: 20}}>Fonts:</Text>
            {this.createFontListEntry("BoyzRGross", "Nick's Fonts", 'https://www.dafont.com/boyzrgross.font')}
            {this.createFontListEntry("aAlloyInk", "wep", 'https://www.dafont.com/a-alloy-ink.font')}
            {this.createFontListEntry("Fipps", "pheist", 'https://www.dafont.com/fipps.font')}
            {this.createFontListEntry("Fire Wood", "Bionic Type",'https://www.dafont.com/fire-wood.font')}
            {this.createFontListEntry("Retro Stereo Wide", "Gus Thessalos",'https://www.dafont.com/retro-stereo-wide.font')}
            {this.createFontListEntry("Vanilla Whale", "Typodermic Fonts",' https://www.dafont.com/vanilla-whale.font')}
            {this.createFontListEntry("Batman Beat the hell Outta Me", "Grilled Cheese")}
            {this.createFontListEntry("Tanomuze Cowboy", "Goma Shin",)}
            {this.createFontListEntry("Nathaniel-19", " Adam Jedrzejewski",)}
            {this.createFontListEntry("Vigilante Typeface Corporation", "Komika Title",)}
            {this.createFontListEntry("Stranger Things", "Stranger Things")}
            {this.createFontListEntry("A Aha Wow", "wep")}
            {this.createFontListEntry("Air Americana", "Tiago Sá")}

            <Text style={{alignSelf: 'center', fontSize: 20}}>Licenses:</Text>
            {this.createLicensesList("@react-native-community/cameraroll@1.7.2", 'MIT', "^1.7.2",)}
            {this.createLicensesList("@react-native-community/masked-view", 'MIT', "0.1.10",)}
            {this.createLicensesList("@react-native-community/picker", 'MIT', "^1.6.3",)}
            {this.createLicensesList("@react-native-firebase/admob", 'Apache-2.0', "^7.2.0",)}
            {this.createLicensesList("@react-native-firebase/app", "Apache-2.0", "^7.2.1",)}
            {this.createLicensesList("@react-native-firebase/firestore", "Apache-2.0", "^7.1.7",)}
            {this.createLicensesList("@react-native-firebase/storage", "Apache-2.0", "^7.1.4",)}

            {this.createLicensesList("@react-navigation/native", "MIT", "^5.5.1",)}
            {this.createLicensesList("@react-navigation/stack", "MIT", "^5.5.1",)}

            {this.createLicensesList("buffer", "MIT", "^5.5.1",)}

            {this.createLicensesList("deprecated-react-native-listview", 'BSD-3-Clause', "0.0.6",)}

            {this.createLicensesList("gl-react-native", "MIT", "^4.0.1",)}
            {this.createLicensesList("gl-react", "MIT", "^4.0.1",)}
            {this.createLicensesList("react-native-color-matrix-image-filters", "MIT", "^5.2.5",)}
            {this.createLicensesList("gl-react-image", "MIT", "^3.1.1",)}
            {this.createLicensesList("markov-generator", "ISC", "^1.2.2",)}

            {this.createLicensesList("random-words", "MIT", "^1.1.1",)}
            {this.createLicensesList("react-native-dropdown-picker", "MIT", "^5.5.1",)}
            {this.createLicensesList("react-native-elements", "MIT", "^2.0.2",)}
            {this.createLicensesList("react-native-gesture-handler", "MIT", "^1.6.1",)}

            {this.createLicensesList("react-native-gl-image-filters", "MIT", "^0.1.1",)}
            {this.createLicensesList("react-native-modal-dropdow", "MIT", "^0.7.0 ",)}
            {this.createLicensesList("eact-native-modal", "MIT", "^11.5.6",)}
            {this.createLicensesList("react-native-reanimated", "MIT", "^1.9.0",)}
            {this.createLicensesList("react-native-safe-area-context", "MIT", "^3.0.5",)}
            {this.createLicensesList("react-native-screens", "MIT", "^2.8.0",)}

            {this.createLicensesList("react-native-share", "MIT", "^3.3.3",)}
            {this.createLicensesList("react-native-unimodules", "MIT", "^0.10.1",)}
            {this.createLicensesList("react-native-vector-icons", "MIT", "^6.6.0  ",)}
            {this.createLicensesList("react-native-view-shot", "MIT", "^3.1.2",)}
            {this.createLicensesList("react-native", "MIT", "^0.62.2",)}
            {this.createLicensesList("react", "MIT", "^16.11.0",)}
            
          </ScrollView>
        )
    }    

    private createLicensesList = (name: string, license: string, version: string, username? : string) =>  {
      return (
        <View style={{justifyContent:'center', alignSelf:'center', borderRadius: 2, borderWidth:2, borderColor: 'gray'}}>
          {name &&  <Text>{'Library Name: ' + name}</Text>}
          {license &&  <Text>{'License: '+license}</Text>}
          {version &&  <Text>{'Version: '+version}</Text>}
          {username &&  <Text>{'Github Username: '+username}</Text>}
        </View>
      )
    };

    private createFontListEntry = (name: string, username: string, link?: string, ) =>  {
      return (
        <View style={{justifyContent:'center', alignSelf:'center', borderRadius: 2, borderWidth:2, borderColor: 'gray'}}>
          {name &&  <Text>{'Font Name: ' + name}</Text>}
          {/* <Text style={{color: 'blue', textDecorationLine:'underline'}}
              onPress={() => Linking.openURL(link)}>
              {'Source: ' + link}
          </Text> */}
          <Text style={{color: 'blue', textDecorationLine:'underline'}}
              onPress={() => Linking.openURL('https://www.dafont.com/')}>
              {'Source: ' + 'https://www.dafont.com/'}
          </Text>
          <Text>{'License: 100% Free'}</Text>
          {username &&  <Text>{'Font Author: '+username}</Text>}
        </View>
      )
    };
}

export default Licenses;

const styles = StyleSheet.create({
  parentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  rowContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
  },
  img: {
    flex: 1,
    resizeMode: 'contain'
  }
});