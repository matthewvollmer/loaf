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
}

interface Props {

}

interface Refs {
  viewShot? : ViewShot | null
}


export default class App extends React.Component<Props, State> {
  public randomWords = require('random-words');
  public refs2 : Refs = {};
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
          'Fipps-Regular'
       ],
       buzzwords: [
         'Loaf',
         'Maeby',
         'dingus',
         'boner',
         'pee pee',
         'fart',
         'miller lite',
         'bred',
         'baja blast',
         'gourd',
         'butt',
         'peepeepoopoo',
         'use case',
         'slams',
         'on the ground',
         'dildo',
         'bean',
         'magumbos',
         'meat',
         'crisp millie'
       ]
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
    this.setState({ imageRefArray: await firebase.storage().ref().child("loafPics").listAll()})
    this.generate();
  }

  public render() {
    return  (
      <View style={{
          justifyContent: 'space-between',
          flex:1
        }}>
        <View style={{borderWidth:2, borderColor: 'gray', top:0, backgroundColor: 'azure'}}>
          <Text style={{textAlign:'center', alignSelf:'center', fontSize: 24}}>Loaf Meme Generator</Text>
        </View>
        <View style={{alignSelf: 'center', borderColor: 'black', borderRadius: 4, borderWidth: 2, justifyContent:'center', width:350}}>
          <ViewShot
            ref="viewShot"
            style={styles.body}
            onCapture={(uri: any) => this.onCapture(uri)}>
              <Image
                 source={this.state.sourceImage}
                 resizeMode= 'contain'
                 style={{
                  width: 350,
                  height: 350,
                  resizeMode: 'contain',
                  alignSelf: 'center',}}
                 onLoadStart={ () => this.setState({imageLoading: true})}
                 onLoadEnd = {() => this.setState({imageLoading: false})}
              >
                <ActivityIndicator animating= {this.state.imageLoading} 
                  style={{
                    alignSelf: 'center', flex:1}}>
                </ActivityIndicator>
              </Image>
              <Text style={{textAlign:'center', alignSelf:'center', width: 350, flexWrap:'wrap',
                  fontFamily: this.state.font,
                  fontSize: this.state.font==='Fipps-Regular' ? 14 : 20}}>
                {this.state.memeText}
              </Text>
          </ViewShot>
        </View>
        <View style={{}}>
          <Button buttonStyle={{alignSelf:'center', marginVertical:12, width:200}} onPress={this.generate} title={'Generate Meme'}/>
          <Button buttonStyle={{alignSelf:'center', marginVertical:12,  width:200}} onPress={this.cap} title={'Save Photo'}/>
          <Button buttonStyle={{alignSelf:'center', marginVertical:12,  width:200}} onPress={this.handleShare} title={'Share Photo'}/>
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

    this.setState({
      sourceImage: {uri: newUri},
      imageIndex: randomNumberForImage,
      memeText: firstCharUppercase,
      font: this.state.fontArray[randomNumberForFont],
    })
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
});
