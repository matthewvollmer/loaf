import React from 'react';
import { StyleSheet, View, ScrollView, Image, ImageSourcePropType, FlatList, PermissionsAndroid, ActivityIndicator, ToastAndroid, Platform} from 'react-native';
import { Button, Text } from 'react-native-elements'
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Loaf } from '../data/types';
import { getLoafs, getUserLoafRef, getLoafImageUrl, likeLoaf } from '../data/loafs';
import ImageFilters from 'react-native-gl-image-filters';
import { Surface } from 'gl-react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modal'
import Share from 'react-native-share';
import {Picker} from '@react-native-community/picker';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import DropDownPicker from 'react-native-dropdown-picker';
import ModalDropdown from 'react-native-modal-dropdown';

//interface Props extends NavigationInjectedProps {}

type LeaderboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Leaderboard'
>;

type LeaderboardScreenRouteProp = RouteProp<RootStackParamList, 'Leaderboard'>;

type Props = {
    route: LeaderboardScreenRouteProp;
    navigation: LeaderboardScreenNavigationProp;
};

interface LoafWithIndex {
  creator: string,
  score: number,
  date: any,
  index: number,
  id: string,
  liked: boolean,
}

interface State {
  //loafs: {loaf: Loaf, imagePath : string}[],
  loafs: LoafWithIndex[],
  imageUris: string[],
  images: ImageSourcePropType[],
  loafCount: number,
  loading: boolean,
  sortingMode: string,
  startAt?: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  prevAt?: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  moreToLoad : boolean
}

class Leaderboard extends React.Component<Props, State> { 
    constructor(props: Readonly<Props>) {
      super(props);

      this.state = {
        loafs: [],
        imageUris: [],
        loafCount: 5,
        images: [],
        loading:true,
        sortingMode: 'Newest',
        moreToLoad: true
      }
  }

  public async componentDidMount () {
    if (Platform.OS==='android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "Read storage permissions",
            message:
              "Loaf needs access to your file storage so it can display images",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("You can read the storage");
        } else {
          console.log("Read Storage permission denied");
        }
      } catch (err) {
        console.warn(err);
      }
    }
  await this.buildLoafs();
}

  public componentWillUnmount() {
    this.setState({loading:false})
  }


    public render() {
        return (
          <View>
            <Modal isVisible={this.state.loading && this.state.loafs.length===0}
            onBackButtonPress={() => {
                this.setState({loading:false})
                this.props.navigation.navigate('Main')}}
            >
              <ActivityIndicator size='large' style={{alignSelf:'center'}} color='white'></ActivityIndicator>
            </Modal>
            <FlatList
              data={this.state.sortingMode!=='newest' ? this.state.loafs.sort((a,b)=> b.score-a.score) : 
                    this.state.loafs}
              ListHeaderComponentStyle={{zIndex: 999}}
              ListHeaderComponent={
              // <DropDownPicker
              //   items={[
              //       {label:"Newest", value:"newest"},
              //       {label:"Top From Today", value:"topToday"},
              //       {label:"Top This Week", value:"topThisWeek"},
              //       {label:"Top All Time", value:"topAllTime"},
              //   ]}
              //   defaultValue={"newest"}
              //   containerStyle={{
              //     alignSelf:'center', width:220,
              //     marginTop: 12, 
              //     marginBottom: this.state.loading && this.state.loafs.length===0 ? 12 : 0,
              //     zIndex: 999
              //   }}
              //   labelStyle={styles.buttonTitleStyle}
              //   onChangeItem={(item) => this.handleChangeSortMethod(item.value.toString())}
              // />
              <ModalDropdown
                style={{alignSelf: 'center', width: '60%', height:30, 
                  marginTop: 12, 
                  marginBottom: this.state.loading && this.state.loafs.length===0 ? 12 : 0,
                  justifyContent:'center', backgroundColor:'white'

                 }}
                options={['Newest', 'Top This Week', 'Top All Time', 'Top Today']}
                dropdownStyle={{alignSelf: 'center',width:'60%'}}
                onSelect={(idx, value) => this.handleChangeSortMethod(value)}
                defaultValue="Newest"
                textStyle={[styles.buttonTitleStyle,{alignSelf: 'center'}]}
                dropdownTextStyle={styles.buttonTitleStyle}
                animated={true}
                
              />
              }
              ListFooterComponent={
                <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                  <Button buttonStyle={styles.buttonStyle} titleStyle={styles.buttonTitleStyle} disabled={!this.state.moreToLoad || this.state.loading}
                    onPress={this.handleNext}  title="Next" iconRight={true} icon={this.state.startAt && this.state.loafs.length>0 && this.state.loading && 
                      <ActivityIndicator style={{marginLeft: 4}} size='small' color='white'></ActivityIndicator>
                    }></Button>
                </View>
              }
              renderItem={(item) => {
                let uri =  this.state.imageUris[item.index];
                console.log('image uri going into image is: '+ uri)
                return <View style={{borderRadius: 4, zIndex: 0, borderWidth: 2, borderColor: 'black', margin: 12, alignSelf: 'center'}}>
                    <Text style={{textAlign:'center', fontSize: 18, fontFamily: 'Nathaniel19-Regular'}}>{'Loafer: '+item.item.creator}</Text>
                    <Text style={{textAlign:'center', fontSize: 18, fontFamily: 'Nathaniel19-Regular'}}>{'Created: ' + item.item.date.toDate().toLocaleDateString()}</Text>
                    <Image source= {{uri: uri}} resizeMode='contain' style={{ width: 350, height: 350, alignSelf:'center' }}/>
                    <View style={{flexDirection: 'row', justifyContent:'center'}}>
                      <Button buttonStyle={{margin:8, width: 110, alignSelf: 'center'}} 
                        onPress={() => this.handleLike(item.item.id, item.index)} title={item.item.liked ? (item.item.score+1).toString() : item.item.score.toString()} 
                        disabled={this.state.loafs[item.index].liked}
                        titleStyle={{fontSize: 18, fontFamily: 'Nathaniel19-Regular'}}
                        icon= {
                          <Icon style={{left:0, marginRight: 12 }} name='thumbs-o-up' size={20} color='white'/>
                      }/>
                      <Button buttonStyle={{margin:8, width: 110, alignSelf: 'center'}}
                      onPress={() => this.handleShare(item.index)}
                      titleStyle={{fontSize: 18, fontFamily: 'Nathaniel19-Regular'}}
                      title="Share"></Button>
                    </View>
                    
               </View>
              }}
              keyExtractor={(item, index) => index.toString()}
            ></FlatList>
          </View>
        )
    }    

    private handlePrev = () => {
        //const subtraction = this.state.startAt - this.state.loafCount;
        this.setState({startAt: this.state.prevAt})
        this.buildLoafs();
    }

    private handleNext = () => {
      //this.setState({startAt : this.state.startAt + this.state.loafCount})
      //this.setState({prevAt : this.state.startAt})
      this.buildLoafs();
    }

    private handleChangeSortMethod = async (sortingMode: string) => {
      console.log("YYY " + sortingMode)
      await this.setState({
        sortingMode: sortingMode,
        startAt : undefined,
        loafs : [],
        imageUris: [],
        images: [],
        moreToLoad: true
      });
      this.buildLoafs();
    }

    private handleLike = (id : string, index: number) => {
      likeLoaf(id)
      let loafs = this.state.loafs;
      loafs[index].liked=true
      this.setState({loafs: loafs})
    }

    private handleShare = async (index : number) => {
      const shareOptions = {
        title: 'Share via',
        message: 'Enjoy this wonderful meme created with Loaf',
        url: this.state.imageUris[index],
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


    private buildLoafs = async () => {
      this.setState({loading: true})
      let loafsArray = [];
      let iamgesArray = [];
      let images = [];
      let loafs : FirebaseFirestoreTypes.QuerySnapshot; 
      console.log("sorting mode is: " + this.state.sortingMode)
      switch(this.state.sortingMode) {
        case('Newest') :
          loafs = this.state.startAt ? await (await getLoafs()).orderBy('loaf.date', 'desc').startAfter(this.state.startAt).limit(this.state.loafCount).get() :
            await (await getLoafs()).orderBy('loaf.date', 'desc').limit(this.state.loafCount).get();
          break;
        case('Top Today') : 
          let yesterday = new Date();
          yesterday.setDate(yesterday.getDate()-1);
          loafs = this.state.startAt ? await (await getLoafs()).where('loaf.date', '>', yesterday).startAfter(this.state.startAt).limit(this.state.loafCount).get() :
            await (await getLoafs()).where('loaf.date', '>', yesterday).limit(this.state.loafCount).get();
          break;
        case('Top This Week') : 
          let lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate()-7);
          loafs = this.state.startAt ? await (await getLoafs()).where('loaf.date', '>', lastWeek).startAfter(this.state.startAt).limit(this.state.loafCount).get() :
            await (await getLoafs()).where('loaf.date', '>', lastWeek).limit(this.state.loafCount).get();
          break;
        case('Top All Time') : 
          loafs = this.state.startAt ? await (await getLoafs()).orderBy('loaf.score', 'desc').startAfter(this.state.startAt).limit(this.state.loafCount).get() :
            await (await getLoafs()).orderBy('loaf.score', 'desc').limit(this.state.loafCount).get();
          break;
      }
      this.setState({startAt: loafs.docs[loafs.docs.length-1]});
      //await (await getLoafs()).orderBy('loaf.score', 'desc').limit(this.state.loafCount).get();
      for (let i: number=0; i< loafs.docs.length; i++){
        let loafId = loafs.docs[i].id;
        console.log('loafs ID ' + loafId)
        let loafData = loafs.docs[i].data();
        let uri = await getLoafImageUrl(loafId);
        console.log("creator: " + loafData.loaf.creator + ' index:' + i);
        loafsArray.push({creator: loafData.loaf.creator, date: loafData.loaf.date, score: loafData.loaf.score, index: i, id: loafId, liked: false});
        let nodeRequire = await fetch(uri);
        images.push(nodeRequire);
        iamgesArray.push(uri)
        console.log("index: " + i + " imageUri: " + uri);
      };
      if (this.state.loafs.length === 0) {
        this.setState({
          loafs: loafsArray,
          imageUris: iamgesArray,
          images: images,
          loading: false,
          moreToLoad : loafsArray.length < this.state.loafCount ? false : true
        })
      } else {
        this.setState({
          loafs: [...this.state.loafs, ...loafsArray],
          imageUris: [...this.state.imageUris, ...iamgesArray],
          images: [...this.state.images, images],
          loading: false,
          moreToLoad : loafsArray.length < this.state.loafCount ? false : true
        })
      }
      //console.log("XXX iamges size: " + images.length + 'XXX image uri is: ' + images[0].uri);
    }
}

export default Leaderboard;

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
  },
  buttonStyle:{
    alignSelf:'center', 
    marginHorizontal:8, 
    width:100,
    marginBottom: 12
  }

});