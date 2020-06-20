/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  PermissionsAndroid,
  ImageSourcePropType,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';

import {Button,Image, Input} from 'react-native-elements'

import CameraRoll from "@react-native-community/cameraroll";

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import ViewShot from 'react-native-view-shot';
import {firebase, FirebaseStorageTypes} from '@react-native-firebase/storage';
import Share from 'react-native-share';
import ImageFilters from 'react-native-gl-image-filters';
import { Surface } from 'gl-react-native';
import { createLoaf, getLoafs } from '../data/loafs';
import { buzzwords } from '../data/buzzwords'
import { script } from "../data/script"
import Modal from 'react-native-modal';
import admob, { BannerAd, TestIds, MaxAdContentRating, BannerAdSize } from '@react-native-firebase/admob';
import { MarkovGen } from 'markov-generator'
import { Loaf } from '../data/types';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

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
  temperature: number,
  showNameEntry: boolean,
  loaferName?: string,
  submitPending:boolean,
  markov?: MarkovGen,

  regenerateMarkovAfterCount: number,
  countSinceRegenerateMArkov: number,
}

interface Props {

}

interface Refs {
  viewShot? : ViewShot | null
}


export default class Generator extends React.Component<Props, State> {
  public randomWords = require('random-words');
  public refs2 : Refs = {};
  constructor(props: Readonly<Props>) {
    super(props);

    this.state = {
      captureUri: '',
      //sourceImage: require('./assets/images.png'),
      memeText: '',
       imageLoading: true,
       font: 'aAlloyInk',
       fontArray: [
          'aAlloyInk',
          'monospace',
          'Nathaniel19-Regular',
          'Fipps-Regular',
          'BatmanBeatthehellOuttaMe',
          'firewood',
          'BoyzRGross',
          'gomarice_tanomuze_cowboy',
          'Retro_Stereo_Wide',
          'vanillawhale'
       ],
       buzzwords: buzzwords,
       hue: 0,
       blur: 0,
       sepia:0,
       sharpen: 0,
       negative: 0,
       contrast: 1,
       saturation: 1,
       temperature: 6500,
       showNameEntry: false,
       submitPending: false,
       regenerateMarkovAfterCount: 6,
       countSinceRegenerateMArkov: 0
    }
  }

  public async componentDidMount() {
    await this.generateMarkov();
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
    await this.setState({ imageRefArray: await firebase.storage().ref().child("loafPics").listAll()})
    await this.generate();
  }

  public render() {
    const adId = __DEV__ ?  TestIds.BANNER : "ca-app-pub-9855234796425536/6028942568";
    return  (
      <View style={{
          justifyContent: 'space-between',
          flex:1
        }}>
        <View style={{ top:0}}>
        </View>
        <Modal isVisible={this.state.submitPending}
            >
              <ActivityIndicator size='large' style={{alignSelf:'center'}} color='white'></ActivityIndicator>
            </Modal>
        <Modal isVisible={this.state.showNameEntry}
          onBackButtonPress={() => this.setState({showNameEntry: false})}
          onBackdropPress={() => this.setState({showNameEntry: false})}
        >
          <View style={{backgroundColor:'white', borderRadius: 12, 
              alignSelf: 'center', justifyContent:'flex-start'}}>
            <Text style={[styles.buttonTitleStyle, {margin:12, fontSize: 24, textAlign:'center'}]}>Who created this loaf masterpiece?</Text>
            <Input 
              containerStyle={{margin: 12, alignSelf: 'center', width:250}}
              label='Loafer' labelStyle={styles.buttonTitleStyle} inputStyle={styles.buttonTitleStyle}
              value={this.state.loaferName}
              onChangeText={(text) => this.setState({loaferName: text})}
              />
            <Button 
              buttonStyle={{width: 200, alignSelf: 'center', marginBottom: 24}}
              titleStyle={styles.buttonTitleStyle} title='Submit Loaf' disabled={!this.state.loaferName}
              onPress={this.handleSubmitToLeaderboard}
            ></Button>
          </View>
        </Modal>
        <View style={{alignSelf: 'center', borderColor: 'black', borderRadius: 4, borderWidth: 2, justifyContent:'center', width:350}}>
          {this.state.imageLoading ? 
          <View
            style={{width:350, height:400}}>
              <ActivityIndicator size='large' style={{alignSelf: 'center', top:180}}></ActivityIndicator>
          </View> : 
          <ViewShot
            ref="viewShot"
            style={styles.body}
            options={{format:'jpg', quality:.2}}
            onCapture={(uri: any) => this.onCapture(uri)}>
              <Surface
                style={{width:350, height:350, }}
              >
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
          </ViewShot>}
        </View>
        <View style={{}}>
          <Button buttonStyle={{alignSelf:'center', marginVertical:8, width:220}} onPress={this.generate} title={'Generate Meme'} titleStyle={styles.buttonTitleStyle}/>
          <Button buttonStyle={{alignSelf:'center', marginVertical:8, width:220}} onPress={this.handleSubmitToLeaderboardPress} title={'Submit To Leaderboard'} titleStyle={styles.buttonTitleStyle}/>
          <Button type='outline' buttonStyle={{alignSelf:'center', marginVertical:8, width:220}} onPress={this.cap} title={'Save To Phone'} titleStyle={styles.buttonTitleStyle}/>
          <Button type='outline' buttonStyle={{alignSelf:'center', marginVertical:8, width:220}} onPress={this.handleShare} title={'Share External'} titleStyle={styles.buttonTitleStyle}/>
        </View>
        <View style={{bottom:0, alignSelf: 'center'}}>
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
      //backgroundBottomColor: '#fefefe',
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

  private handleSubmitToLeaderboardPress = () => {
    this.setState({showNameEntry: true});
  }

  private handleSubmitToLeaderboard = async () => {
    this.setState({submitPending: true})
    await this.capWithoutSave();
    await createLoaf(
      {
        creator: this.state.loaferName, 
        date: new Date(), 
        score: 1,
        text: this.state.memeText
      },
      this.state.captureUri);
    this.setState({showNameEntry: false, submitPending: false});
  }


  private replaceRandomWordWithBuzzWord (memeText : string, numWords: number) {
    let randomWordsSplit = memeText.split(' ');
    let randomNumberForWords : number = Math.floor(Math.random() * numWords);
    randomWordsSplit[randomNumberForWords] = this.getRandomBuzzWord();
    return randomWordsSplit.join(' ')
  }

  private getRandomBuzzWord = () => {
    const randomNumberForWords : number = Math.floor(Math.random() * this.state.buzzwords.length);
    return this.state.buzzwords[randomNumberForWords];
  }

  private generateMarkov = async () => {
    let scriptCopy = script;
    let lastWeek = new Date();
    //Calculate last week
    lastWeek.setDate(lastWeek.getDate()-7);
    //Pull in top loafs of last week
    let loafs : FirebaseFirestoreTypes.QuerySnapshot = 
      await (await getLoafs()).where('loaf.date', '>', lastWeek).limit(12).get();
    //Add recent top loaf texts to the markov, weighted. 
    loafs.forEach((loaf: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
      let loafData = loaf.data();
      console.log("this loaf's data: #" + loafData.loaf.score + " text:" + loafData.loaf.text)
      if (loafData.loaf.text) {
        for (let i: number = 0; i<loafData.loaf.score; i++) {
          scriptCopy.push(loafData.loaf.text);
        }
      }
    })
    const MarkovGen = require('markov-generator');
    this.setState({
      markov: new MarkovGen({input: scriptCopy, minLength: 3})
    })
  }

  private generateMarkovSafely = () => {
    this.setState({
      markov: new MarkovGen({input: script, minLength: 3})
    })
  }

  private regenerateMarkovIfNeeded = async () => {
    if (this.state.countSinceRegenerateMArkov === this.state.regenerateMarkovAfterCount) {
      try{
        await this.generateMarkov();
      }
      catch (err) {
        console.log("retrieval for markov failed. generating from stored library")
        if (!this.state.markov) {
          this. generateMarkovSafely();
        }
      }
    }
    this.setState({
      countSinceRegenerateMArkov : this.state.countSinceRegenerateMArkov+1
    })
  }

  private generate = async () => {
    await this.regenerateMarkovIfNeeded();
    this.setState({imageLoading: true});

    let randomNumberForImage : number;
    randomNumberForImage = Math.floor(Math.random() * this.state.imageRefArray.items.length);
    if (randomNumberForImage == this.state.imageIndex) {
      randomNumberForImage = Math.floor(Math.random() * this.state.imageRefArray.items.length);
    }
    const newUri  = await this.state.imageRefArray.items[randomNumberForImage].getDownloadURL();
    const randomNumberForFont : number = Math.floor(Math.random() * this.state.fontArray.length);

    let memeText = this.state.markov.makeChain();
    const numWords = memeText.split(" ").length;
    if (numWords > 6) {
      memeText = this.replaceRandomWordWithBuzzWord(memeText, numWords);
      memeText = this.replaceRandomWordWithBuzzWord(memeText, numWords);
    }
    else {
      memeText = this.replaceRandomWordWithBuzzWord(memeText, numWords);
    }
    if (!memeText.endsWith(".")) {memeText += '.'}
    let firstCharUppercase = memeText.charAt(0).toUpperCase() + memeText.slice(1)
    

    await this.setState({
      sourceImage: {uri: newUri},
      imageIndex: randomNumberForImage,
      memeText: firstCharUppercase,
      testUri: newUri,
      font: this.state.fontArray[randomNumberForFont],
    })

    this.applyRandomFilter();
    this.setState({imageLoading: false})
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
    const uri = await this.refs.viewShot.capture();
    CameraRoll.save(uri)
  }

  private capWithoutSave = async () => {
    const uri = await this.refs.viewShot.capture();
  }
  
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.white,
  },
  buttonTitleStyle: {
    fontFamily:'Nathaniel19-Regular', 
  }
});
