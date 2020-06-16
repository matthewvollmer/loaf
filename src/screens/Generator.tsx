/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  PermissionsAndroid,
  ImageSourcePropType,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';

import {Button,Image} from 'react-native-elements'

import CameraRoll from "@react-native-community/cameraroll";

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import ViewShot from 'react-native-view-shot';
import {firebase, FirebaseStorageTypes} from '@react-native-firebase/storage';
import Share from 'react-native-share';
import ImageFilters from 'react-native-gl-image-filters';
import { Surface } from 'gl-react-native';
import { createLoaf } from '../data/loafs';
import { buzzwords } from '../data/buzzwords'

interface State {
  captureUri: string,
  sourceImage?: ImageSourcePropType,
  memeText: string,
  imageRefArray?: FirebaseStorageTypes.ListResult,
  imageLoading: boolean,
  font: string,
  fontArray: string[],
  imageIndex?: number,
  buzzwords: string[],
  testUri?: string,
  hue: number,
  blur: number,
  sepia:number,
  sharpen: number,
  negative: number,
  contrast: number,
  saturation: number,
  temperature: number
}

interface Props {

}

interface Refs {
  viewShot? : ViewShot | null
}


export default class Generator extends React.Component<Props, State> {
  public randomWords = require('random-words');
  public refs2 : Refs = {};
  loading: boolean = false;
  constructor(props: Readonly<Props>) {
    super(props);

    this.state = {
      captureUri: '',
      //sourceImage: require('./assets/images.png'),
      memeText: '',
       imageLoading: false,
       font: 'aAlloyInk',
       fontArray: [
          'aAlloyInk',
          'monospace',
          'Nathaniel19-Regular',
          'Fipps-Regular',
          'BatmanBeatthehellOuttaMe',
          'firewood',
          'BoyzRGross'
       ],
       buzzwords: buzzwords,
       hue: 0,
       blur: 0,
       sepia:0,
       sharpen: 0,
       negative: 0,
       contrast: 1,
       saturation: 1,
       temperature: 6500
    }
  }

  public async componentDidMount() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Write storage permissions",
          message:
            "Cool Photo App needs access to your camera " +
            "so you can take awesome pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the storage");
      } else {
        console.log("Storage permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
    let options = {
      apiKey: "AIzaSyCwUzvsBSb6N6i81R23BIWStK4nXNJJYSM",
      //authDomain: "<your-auth-domain>",
      databaseURL: "<https://loaf-eaa81.firebaseio.com/loafs",
      storageBucket: "gs://loaf-eaa81.appspot.com",
      appId: '1:924078627556:android:fe397332cc08da21952af1',
      projectId: 'loaf-eaa81'
    }
    !firebase.apps.length ? firebase.initializeApp(options) : firebase.app();
    await this.setState({ imageRefArray: await firebase.storage().ref().child("loafPics").listAll()})
    await this.generate();
  }

  public render() {
    return  (
      <View style={{
          justifyContent: 'space-between',
          flex:1
        }}>
        <View style={{ top:0}}>
        </View>
        <View style={{alignSelf: 'center', borderColor: 'black', borderRadius: 4, borderWidth: 2, justifyContent:'center', width:350}}>
          <ViewShot
            ref="viewShot"
            style={styles.body}
            onCapture={(uri: any) => this.onCapture(uri)}>
              <Surface
                style={{width:350, height:350, backgroundBottomColor: 'white'}}
              >
                  {/* {this.state.imageLoading ? 
                  <View style={{width:350, height: 350}}>
                    <ActivityIndicator animating={this.loading}></ActivityIndicator> 
                  </View>: */}
                  <ImageFilters
                    width={350}
                    height={350}
                    hue={this.state.hue}
                    sepia={this.state.sepia}
                    sharpen={this.state.sharpen}
                    negative={this.state.negative}
                    saturation={this.state.saturation}
                    temperature={this.state.temperature}
                    >
                    {{uri: this.state.testUri}}
                  </ImageFilters>
              {/* } */}
              </Surface>
              <Text style={{textAlign:'center', alignSelf:'center', width: 350, flexWrap:'wrap',
                  fontFamily: this.state.font,
                  fontSize: this.state.font==='Fipps-Regular' ? 14 : 20}}>
                {this.state.memeText}
              </Text>
          </ViewShot>
        </View>
        <View style={{}}>
          <Button buttonStyle={{alignSelf:'center', marginVertical:8, width:220}} onPress={this.generate} title={'Generate Meme'} titleStyle={styles.buttonTitleStyle}/>
          <Button buttonStyle={{alignSelf:'center', marginVertical:8, width:220}} onPress={this.handleSubmitToLeaderboard} title={'Submit To Leaderboard'} titleStyle={styles.buttonTitleStyle}/>
          <Button type='outline' buttonStyle={{alignSelf:'center', marginVertical:8, width:220}} onPress={this.cap} title={'Save To Phone'} titleStyle={styles.buttonTitleStyle}/>
          <Button type='outline' buttonStyle={{alignSelf:'center', marginVertical:8, width:220}} onPress={this.handleShare} title={'Share External'} titleStyle={styles.buttonTitleStyle}/>
        </View>
      </View>
    )
  }

  private onCapture = uri => {
    this.setState({captureUri: uri})
  };

  private handleShare = async () => {
    this.capWithoutSave();
    const shareOptions = {
      title: 'Share via',
      message: 'Enjoy this wonderful meme created with Loaf',
      url: this.state.captureUri,
      social: Share.Social.INSTAGRAM_STORIES,
      backgroundBottomColor: '#fefefe',
      backgroundTopColor: '#906df4',
      filename: 'test' , // only for base64 file in Android
  };
    try {
      await Share.open(shareOptions);
    }
    catch (err) {
      ToastAndroid.show(err.message, ToastAndroid.SHORT);
    }
  }

  private handleSubmitToLeaderboard = async () => {
    await this.capWithoutSave();
    createLoaf({creator:'TEST', date: new Date(), score: 1},this.state.captureUri);
  }



  private replaceRandomWordWithBuzzWord (randomWords : string[], numWords: number) {
    const randomNumberForWords : number = Math.floor(Math.random() * numWords);
    randomWords[randomNumberForWords] = this.getRandomBuzzWord();
    return randomWords;
  }

  private getRandomBuzzWord = () => {
    const randomNumberForWords : number = Math.floor(Math.random() * this.state.buzzwords.length);
    return this.state.buzzwords[randomNumberForWords];
  }

  private generate = async () => {
    this.setState({imageLoading: true})
    this.loading = true;
    const numWords = Math.floor(Math.random() * (7-3) + 3)
    let randomWords = this.randomWords(numWords);

    if (numWords > 4) {
      this.replaceRandomWordWithBuzzWord(randomWords, numWords);
      this.replaceRandomWordWithBuzzWord(randomWords, numWords);
    }
    else {
      this.replaceRandomWordWithBuzzWord(randomWords, numWords);
    }

    const randomWordsJoined = randomWords.join(' ')
    let firstCharUppercase = randomWordsJoined.charAt(0).toUpperCase() + randomWordsJoined.slice(1) + '.';

    let randomNumberForImage : number;
    randomNumberForImage = Math.floor(Math.random() * this.state.imageRefArray.items.length);
    if (randomNumberForImage == this.state.imageIndex) {
      randomNumberForImage = Math.floor(Math.random() * this.state.imageRefArray.items.length);
    }
    const newUri  = await this.state.imageRefArray.items[randomNumberForImage].getDownloadURL();
    const randomNumberForFont : number = Math.floor(Math.random() * this.state.fontArray.length);

    await this.setState({
      sourceImage: {uri: newUri},
      imageIndex: randomNumberForImage,
      memeText: firstCharUppercase,
      testUri: newUri,
      font: this.state.fontArray[randomNumberForFont],
      imageLoading: false
    })

    this.applyRandomFilter();
    this.setState({imageLoading: false})
    this.loading=false;
  }

  private applyRandomFilter = () => {
    const filterType = Math.floor(Math.random() * 6);
    switch(filterType) {
      case(0): //hue
        this.setState({
          hue:1,
          sepia:0,
          negative:0,
          temperature:6500,
          saturation:1
        })
        break;
      case(1): //sepia
        this.setState({
          hue:0,
          sepia:1,
          negative:0,
          temperature:6500,
          saturation:1
        })
        break;
      case(2): //negative
        this.setState({
          hue:0,
          sepia:0,
          negative:1,
          temperature:6500,
          saturation:1
        })
        break;
      case(3): //hot
        this.setState({
          hue:0,
          sepia:0,
          negative:0,
          temperature:10000,
          saturation:1
        })
        break;
      case(4): //cold
        this.setState({
          hue:0,
          sepia:0,
          negative:0,
          temperature:10,
          saturation:1
        })
        break;
      case(5): //none
        this.setState({
          hue:0,
          sepia:0,
          negative:0,
          temperature:6500,
          saturation:1
        })
        break;
    }
  }

  private cap = async () => {
    console.log("this.refs.viewShot is: " + this.refs.viewShot)
    const uri = await this.refs.viewShot.capture();
    console.log("captureUri was: " + uri);
    CameraRoll.save(uri)
  }

  private capWithoutSave = async () => {
    console.log("this.refs.viewShot is: " + this.refs.viewShot)
    const uri = await this.refs.viewShot.capture();
    console.log("captureUri was: " + uri);
  }
  
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.white,
  },
  buttonTitleStyle: {
    fontFamily:'aAlloyInk', 
  }
});
