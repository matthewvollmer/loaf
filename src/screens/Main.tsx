import React from 'react';
import { StyleSheet, View} from 'react-native';
import { Button } from 'react-native-elements'
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import admob, { BannerAd, TestIds, MaxAdContentRating, BannerAdSize } from '@react-native-firebase/admob';
import AwesomeButton from "react-native-really-awesome-button";

//interface Props extends NavigationInjectedProps {}

type MainScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Main'
>;

type MainScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;

type Props = {
    route: MainScreenRouteProp;
    navigation: MainScreenNavigationProp;
  };

interface State {
}

class Main extends React.Component<Props, State> { 
    constructor(props: Readonly<Props>) {
      super(props);

      this.state = {
      }
  }

  public componentDidMount() {
    admob()
      .setRequestConfiguration({
        // Update all future requests suitable for parental guidance
        maxAdContentRating: MaxAdContentRating.PG,

        // Indicates that you want your content treated as child-directed for purposes of COPPA.
        tagForChildDirectedTreatment: false,

        // Indicates that you want the ad request to be handled in a
        // manner suitable for users under the age of consent.
        tagForUnderAgeOfConsent: true,
      })
      .then(() => {
        // Request config successfully set!
      });
  }

    public render() {
        const adId = __DEV__ ?  TestIds.BANNER : "ca-app-pub-9855234796425536/6028942568";
        return (
          <View style={styles.parentContainer}>
              <AwesomeButton
                  textFontFamily='Nathaniel19-Regular'
                  textSize={18}
                  type='anchor'
                  backgroundColor='#1b8bd5'
                  backgroundDarker='#1c6694'
                  backgroundShadow='#144a6b'
                  backgroundActive="rgba(0,0,0,0)"
                  // style= {styles.img}
                  width={200}
                  onPress={() => this.props.navigation.navigate('Generator')}
                  style={{marginVertical: 12}}>
                  Generator
              </AwesomeButton>
              <AwesomeButton
                  textFontFamily='Nathaniel19-Regular'
                  textSize={18}
                  type='anchor'
                  backgroundColor='#1b8bd5'
                  backgroundDarker='#1c6694'
                  backgroundShadow='#144a6b'
                  backgroundActive="rgba(0,0,0,0)"
                  // style= {styles.img}
                  width={200}
                  onPress={() => this.props.navigation.navigate('Leaderboard')}
                  style={{marginVertical: 12}}>
                  Leaderboard
              </AwesomeButton>
              <View style={{position:'absolute', bottom:0}}>
                <BannerAd 
                  unitId={adId}
                  size={BannerAdSize.BANNER}
                  requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                  }}
                  onAdLoaded={() => {
                    console.log('Advert loaded');}}
                  onAdFailedToLoad={(error: any) => {
                    console.log('Advert failed to load: ', error);}}
                />
              </View>
          </View>
        )
    }    
}

export default Main;
////ca-app-pub-9855234796425536/5453123841
const styles = StyleSheet.create({
  parentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
  },
  img: {
    alignSelf:'center', 
    marginVertical:12, 
    width:200,
    //flex:1,
  },
  buttonTitleStyle: {
    fontFamily:'Nathaniel19-Regular', 
  }
});