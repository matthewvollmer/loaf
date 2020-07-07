import React from 'react';
import { StyleSheet, View, PermissionsAndroid, ImageSourcePropType, ActivityIndicator, ToastAndroid,
  Alert, Platform, Image, Dimensions, ImageProps } from 'react-native';
import { Button, Input, Text } from 'react-native-elements'
import CameraRoll from "@react-native-community/cameraroll";
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ViewShot from 'react-native-view-shot';
import {firebase, FirebaseStorageTypes} from '@react-native-firebase/storage';
import Share from 'react-native-share';
import ImageFilters from 'react-native-gl-image-filters';
import { Surface } from 'gl-react-native';
import { createLoaf, getLoafs } from '../data/loafs';
import { buzzwords } from '../data/buzzwords'
import { script } from "../data/script"
import Modal from 'react-native-modal';
import { BannerAd, TestIds, BannerAdSize } from '@react-native-firebase/admob';
import { MarkovGen } from 'markov-generator'
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { ScrollView } from 'react-native-gesture-handler';
import GLImage from "gl-react-image";
import {Grayscale, Sepia, Tint, Polaroid, Invert, Cool, 
  concatColorMatrices, contrast,saturate, ColorMatrix, Browni, Lsd, HueRotate} from 'react-native-color-matrix-image-filters';
import AwesomeButton from 'react-native-really-awesome-button';

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
  testImage: ImageSourcePropType,
  pictureBoxDimension: number,
  today?: Date,
  week?: Date,
  hasGeneratedFullMarkov: boolean,

  regenerateMarkovAfterCount: number,
  countSinceRegenerateMArkov: number,

  permissionsAlreadyGranted: boolean,
  calculatedButtonHeight: number,
  calculatedButtonGap: number,
  calculatedSmallButtonFontSize: number,

  iosRenderElement?: JSX.Element,
  iosLoading: boolean,
}

interface Props {

}

interface Refs {
  viewShot? : ViewShot | null
}


export default class Generator extends React.Component<Props, State> {
  mounted: boolean;
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
       fontArray: 
       Platform.OS === 'android' ?
       [
          'aAlloyInk',
          'monospace',
          'Nathaniel19-Regular',
          'Fipps-Regular',
          'aAhaWow',
          'KOMTITK_',
          'StrangerThings-Regular',
          'AirAmericana',
          'gomarice_tanomuze_cowboy',
          'Retro_Stereo_Wide',
          'vanillawhale'
       ] : 
       [
        'aAlloyInk',
        'Nathaniel19-Regular',
        'Fipps-Regular',
        'aAhaWow',
        'StrangerThings-Regular',
        // 'AirAmericana',
        'Helvetica-Bold',
        'MalayalamSangamMN',
        'Papyrus',
        'Thonburi',
        'Zapfino'
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
       regenerateMarkovAfterCount: 15,
       countSinceRegenerateMArkov: 0,
       testImage: require('../../assets/BmtIdkrCcAAl39D.jpg'),
       pictureBoxDimension: Dimensions.get('window').height < 670 ? Dimensions.get('window').width * .8 : Dimensions.get('window').width * .85,
       hasGeneratedFullMarkov:false,
       permissionsAlreadyGranted: false,

       calculatedButtonHeight: this.calculateButtonHeight(),
       calculatedButtonGap: Dimensions.get('window').height < 670 ? 2 : 4,
       calculatedSmallButtonFontSize: this.calculateSmallButtonFontSize(),
       iosLoading: false
    }
  }

  private calculateButtonGap= () => {
    const height = Dimensions.get('window').height;
    if (Platform.OS === 'android') {
      if (height< 670) return 2;
      else return 4
    }
    else {
      if (height< 700) return 2;
      else if (height<800) return 3;
      else return 4
    }
  }

  private calculateButtonHeight = () => {
    const height = Dimensions.get('window').height;
    console.log("Height is: " + height);
    if (Platform.OS === 'android') {
      if (height< 640) return 28;
      else if (height < 670) return 32; 
      else return 38;
    }
    else {
      if (height< 700) return 28;
      else if (height < 800) return 32; 
      else return 42;
    }

  }

  private calculateSmallButtonFontSize = () => {
    const height = Dimensions.get('window').height;
    if (height< 640) return 12;
    else if (height<670) return 14;
    else return 18;
  }

  public async componentDidMount() {
    this.mounted=true;
    await this.generateMarkovSafely();
    // let options = {
    //   apiKey: "AIzaSyCwUzvsBSb6N6i81R23BIWStK4nXNJJYSM",
    //   databaseURL: "<https://loaf-eaa81.firebaseio.com/loafs",
    //   storageBucket: "gs://loaf-eaa81.appspot.com",
    //   appId: '1:924078627556:android:fe397332cc08da21952af1',
    //   projectId: 'loaf-eaa81'
    // }
    // console.log("firebase.apps.length: "+ firebase.apps.length)
    // !firebase.apps.length ? firebase.initializeApp(options) : firebase.app();

    var today = new Date();
    today.setHours(0,0,0,0);

    var date = new Date();
    date.setHours(0,0,0,0);
    var day = date.getDay()
    var diff = date.getDate() - day  + (day == 0 ? -6:1)
  
    var week = new Date(date.setDate(diff));
    console.log("today: "+today+" this week: "+week)

    this.setState({ 
      imageRefArray: await firebase.storage().ref().child("loafPics").listAll(),
      today: today,
      week: week
    })
    await this.generate();
  }

  public componentWillUnmount() {
    this.mounted = false;
  }

  public hideNameEntry = () => {
    this.setState({showNameEntry: false});
  }

  public render() {
    const adId = __DEV__ ?  TestIds.BANNER : "ca-app-pub-9855234796425536/6028942568";
    return  (
      <View style={{
          flex:1
        }}>
        <View style={{ top:0}}>
        </View>
        <Modal isVisible={this.state.showNameEntry}
          onBackButtonPress={this.hideNameEntry}
          onBackdropPress={this.hideNameEntry}
          avoidKeyboard={Platform.OS === 'ios'}
          coverScreen={true}
        >
          <View style={{backgroundColor:'white', borderRadius: 12, 
              alignSelf: 'center', justifyContent:'flex-start'}}>
          <Modal 
            isVisible={this.state.submitPending}
            >
          <ActivityIndicator size='large' style={{alignSelf:'center'}} color='white'></ActivityIndicator>
            </Modal>
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
        <View style={{
            alignSelf: 'center', 
            justifyContent:'center', width:this.state.pictureBoxDimension + 4,
            marginVertical: 8
          }}>
          {(this.state.imageLoading) ? 
          <View
            style={{
              width:this.state.pictureBoxDimension + 4, 
              height: this.state.pictureBoxDimension + Dimensions.get("window").height * .1 + 8,
              borderColor: 'black', borderRadius: 4, borderWidth: 2, 
            }}>
              <ActivityIndicator size='large' style={{alignSelf: 'center', top:180}}></ActivityIndicator>
          </View> : 
          <ViewShot
            ref="viewShot"
            style={{backgroundColor: 'white', borderColor: 'black', borderRadius: 4, borderWidth: 2}}
            options={{format:'jpg', quality:.2}}
            onCapture={(uri: any) => this.onCapture(uri)}>
              {Platform.OS === 'android' && Platform.Version > 24 ? 
              <Surface
                preload={[{uri: this.state.testUri}]}
                style={{
                  width:this.state.pictureBoxDimension, 
                  height:this.state.pictureBoxDimension,}}
              >
                <ImageFilters
                  width={this.state.pictureBoxDimension}
                  height={this.state.pictureBoxDimension}
                  hue={this.state.hue}
                  sepia={this.state.sepia}
                  sharpen={this.state.sharpen}
                  negative={this.state.negative}
                  saturation={this.state.saturation}
                  temperature={this.state.temperature}
                  >
                    <GLImage
                      source={{uri: this.state.testUri}}
                      resizeMode='contain'
                      style={{width:this.state.pictureBoxDimension, 
                        height: this.state.pictureBoxDimension}}
                    />
                </ImageFilters>
              </Surface> :
              <View>
                {this.state.iosRenderElement}
              </View> 
              }
              <View style={{
                  position:'absolute', bottom:0, right:0, width:35, 
                  height: 20,backgroundColor: 'aliceblue', zIndex: 1000, opacity: .4,
                  borderRadius: 3
                }}>
                <Text style={{
                  fontFamily:'Nathaniel19-Regular', position:'absolute', 
                  bottom: 0, right: 4, zIndex: 1000, fontSize: 14,
                  opacity: .4
                  }}>
                  loaf
                </Text>
              </View>
              <View style={{
                alignItems:'center', justifyContent: 'center', alignSelf:'center',
                height: Dimensions.get("window").height * .1, 
                marginVertical: 2,
              }}>
                <Text 
                    adjustsFontSizeToFit={true}
                    numberOfLines={4}
                    //maxFontSizeMultiplier={1}
                    minimumFontScale={.8}
                    //lineBreakMode='head'
                    style={{
                      textAlign:'center', 
                      alignSelf:'center', 
                      justifyContent:'center',
                      alignItems:'center',
                      maxHeight: Dimensions.get("window").height * .1,
                      fontFamily: this.state.font,
                      fontSize: this.state.font==='Fipps-Regular' ? 14 : 18,
                    }}>
                  {this.state.memeText}
                </Text>
              </View>

          </ViewShot>}
        </View>
        <ScrollView
          >
          <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
            <AwesomeButton
              textFontFamily='Nathaniel19-Regular'
              textSize={18}
              type='anchor'
              backgroundColor='#1b8bd5'
              backgroundDarker='#144a6b'
              backgroundShadow='#144a6b'
              borderRadius={8}
              height={this.state.calculatedButtonHeight}
              width={220}
              onPress={this.generate}
              style={{alignSelf:'center', marginBottom:this.state.calculatedButtonGap}}
              >
                Generate Meme
            </AwesomeButton>
            <AwesomeButton
              textFontFamily='Nathaniel19-Regular'
              textSize={18}
              type='anchor'
              backgroundColor='#1b8bd5'
              backgroundDarker='#144a6b'
              backgroundShadow='#144a6b'
              borderRadius={8}
              height={this.state.calculatedButtonHeight}
              width={220}
              onPress={this.handleSubmitToLeaderboardPress}
              style={{alignSelf:'center', marginVertical:this.state.calculatedButtonGap+1}}
              >
                Submit To Leaderboard
            </AwesomeButton>
            <AwesomeButton
              textFontFamily='Nathaniel19-Regular'
              textSize={18}
              type='anchor'
              backgroundColor='#FFFFFF'
              backgroundDarker='#1b8bd5'
              backgroundShadow='#1b8bd5'
              textColor='#1b8bd5'
              borderRadius={8}
              borderWidth={1}
              borderColor='#1b8bd5'
              height={this.state.calculatedButtonHeight}
              width={220}
              onPress={this.cap}
              style={{alignSelf:'center', marginVertical:this.state.calculatedButtonGap+1}}
              >
                Save To Phone
            </AwesomeButton>
            <AwesomeButton
                textFontFamily='Nathaniel19-Regular'
                textSize={18}
                type='anchor'
                backgroundColor='#FFFFFF'
                backgroundDarker='#1b8bd5'
                backgroundShadow='#1b8bd5'
                textColor='#1b8bd5'
                borderRadius={8}
                borderWidth={1}
                borderColor='#1b8bd5'
                height={this.state.calculatedButtonHeight}
                width={220}
                onPress={this.handleShare}
                style={{alignSelf:'center', marginVertical:this.state.calculatedButtonGap+1}}
                >
                Share External
            </AwesomeButton>
          </View>
        </ScrollView>
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

  private requestPermissions = async () => {
    if (Platform.OS === 'android'){
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
          this.setState({permissionsAlreadyGranted: true});
        } else {
          console.log("Storage permission denied");
        }
      } catch (err) {
        console.warn(err);
      }
    }
  }

  private checkPermissions = async () => {
    const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    this.setState({permissionsAlreadyGranted: granted});
    if (!granted) {
      await this.requestPermissions();
    }
  }


  private onCapture = uri => {
    this.setState({captureUri: uri})
  };

  private handleShare = async () => {
    await this.capWithoutSave();
    console.log("about to share. uri is: "+ this.state.captureUri);
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
      Platform.OS === 'android' &&
        ToastAndroid.show(err.message, ToastAndroid.SHORT)
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
        text: this.state.memeText,
        day: this.state.today,
        week: this.state.week,
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
    console.log("GENERATING FULL MARKOV!")
    let scriptCopy = script;

    let week : Date = new Date();
    week.setHours(0,0,0,0);
    var day = week.getDay()
    var diff = week.getDate() - day  + (day == 0 ? -6:1)
    var weekstart = new Date(week.setDate(diff));
    let loafs = await (await getLoafs()).where('loaf.week', '==', weekstart).orderBy('loaf.score', 'desc').limit(15).get();
    let topAllTimeLoafs = await (await getLoafs()).orderBy('loaf.score', 'desc').limit(8).get();

    loafs.forEach((loaf: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
      let loafData = loaf.data();
      if (loafData.loaf.text) {
        for (let i: number = 0; i<loafData.loaf.score; i++) {
          scriptCopy.push(loafData.loaf.text);
        }
      }
    })
    topAllTimeLoafs.forEach((topAllTimeLoaf: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
      let topAllTimeLoafData = topAllTimeLoaf.data();
      if (topAllTimeLoafData.loaf.text) {
        for (let i: number = 0; i<topAllTimeLoafData.loaf.score; i++) {
          scriptCopy.push(topAllTimeLoafData.loaf.text);
        }
      }
    })
    const MarkovGen = require('markov-generator');
    this.setState({
      markov: new MarkovGen({input: scriptCopy, minLength: 3}),
      hasGeneratedFullMarkov: true
    })
    console.log("GENERATING FULL MARKOV FINISHED!")
  }

  private generateMarkovSafely = async () => {
    console.log("SAFE GENERATING MARKOV!")
    const MarkovGen = require('markov-generator');
    if (this.mounted){
      await this.setState({
        markov: new MarkovGen({input: script, minLength: 3})
      })
    }
    console.log("SAFE GENERATING MARKOV FINISHED!")
  }

  private regenerateMarkovIfNeeded = async () => {
    if (this.state.countSinceRegenerateMArkov === this.state.regenerateMarkovAfterCount && this.mounted) {
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
      countSinceRegenerateMArkov : this.state.countSinceRegenerateMArkov+1,
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
    if (!this.mounted) return;
    const newUri  = await this.state.imageRefArray.items[randomNumberForImage].getDownloadURL();
    const randomNumberForFont : number = Math.floor(Math.random() * this.state.fontArray.length);

    let memeText = this.state.markov.makeChain();
    const numWords = memeText.split(" ").length;
    if (numWords > 10) {
      memeText = this.replaceRandomWordWithBuzzWord(memeText, numWords);
      memeText = this.replaceRandomWordWithBuzzWord(memeText, numWords);
    }
    else if (numWords > 3){
      memeText = this.replaceRandomWordWithBuzzWord(memeText, numWords);
    }
    if (!(memeText.endsWith(".")||memeText.endsWith("?")||memeText.endsWith("!"))) {memeText += '.'}
    let firstCharUppercase = memeText.charAt(0).toUpperCase() + memeText.slice(1)
    let font : string= this.state.fontArray[randomNumberForFont];
    console.log("selected font was: " + font);

    if (!this.mounted) return;
    await this.setState({
      sourceImage: {uri: newUri},
      imageIndex: randomNumberForImage,
      memeText: firstCharUppercase,
      testUri: newUri,
      font: font,
    })

    if (!this.mounted) return;
    this.applyRandomFilter();
    this.setState({imageLoading: false})
    Platform.OS === 'ios' && this.setState({iosRenderElement: this.generateIOSFilterComponent()});
    if (!this.state.hasGeneratedFullMarkov) {
      this.generateMarkov();
    }
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
    if (!this.state.permissionsAlreadyGranted && Platform.OS === 'android') {
      await this.checkPermissions();
    }
    const uri = await this.refs.viewShot.capture();
    console.log("captured uri was: " + uri);
    let saveString = await CameraRoll.save(uri, {album: 'Loafs', type: 'photo'});
    console.log("Saved to: " + saveString)
    Platform.OS === 'android' ? 
      ToastAndroid.show("Loaf saved to phone.", ToastAndroid.SHORT) :
      Alert.alert("Loaf saved to phone.")
  }

  private capWithoutSave = async () => {
    const uri = await this.refs.viewShot.capture();
  }

  private generateIOSFilterComponent = () => {
    const styleProps = {width:this.state.pictureBoxDimension, height:undefined, aspectRatio: 1}
    const internalImageProps : ImageProps = {
      source: {uri: this.state.testUri, width:this.state.pictureBoxDimension, 
        height: this.state.pictureBoxDimension},
      resizeMode:'contain',
      style: {flex:1},
      
      onLoadStart:  () =>  this.setState({iosLoading: true}),
      onLoadEnd:  () =>  this.setState({iosLoading: false}),
      }
    const filterType = Math.floor(Math.random() * 11);
    switch(filterType) {
      case(0):
        return <Grayscale style={styleProps}> 
          <Image {...internalImageProps} /> 
        </Grayscale>
      case(1): 
        return <Sepia style={styleProps}> 
          <Image {...internalImageProps} /> 
        </Sepia>
      case(2): 
        return <Tint amount={1.25}> 
          <Sepia style={styleProps}> 
            <Image {...internalImageProps} /> 
          </Sepia> 
        </Tint>
      case(3): 
        return <Lsd style={styleProps}> 
          <Image {...internalImageProps} /> 
        </Lsd>
      case(4): 
        return <Polaroid style={styleProps}> 
          <Image {...internalImageProps} /> 
        </Polaroid>
      case(5): 
        return <Invert style={styleProps}> 
          <Image {...internalImageProps} /> 
        </Invert>
      case(6): 
        return <Cool style={styleProps}> 
          <Image {...internalImageProps} /> 
        </Cool>
      case(7): 
        return <View style={styleProps}> 
          <Image {...internalImageProps} /> 
        </View>
      case(8): 
        return <ColorMatrix style={styleProps} matrix={concatColorMatrices([saturate(-0.5), contrast(3.2)])}> 
          <Image {...internalImageProps} /> 
        </ColorMatrix>
      case(9): 
        return <Browni style={styleProps}> 
          <Image {...internalImageProps} /> 
        </Browni>
      case(10): 
        return <HueRotate style={styleProps} amount={2}> 
          <Image {...internalImageProps} /> 
        </HueRotate>
    }
  }
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.white,
  },
  buttonTitleStyle: {
    fontFamily:'Nathaniel19-Regular', 
  },
  smallButtonTitleStyle: {
    fontFamily:'Nathaniel19-Regular', 
    fontSize: 18
  }
});