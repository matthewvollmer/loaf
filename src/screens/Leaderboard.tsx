import React from 'react';
import { StyleSheet, View, Image, ImageSourcePropType, FlatList, ActivityIndicator, ToastAndroid} from 'react-native';
import { Button, Text } from 'react-native-elements'
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { getLoafs, getLoafImageUrl, likeLoaf } from '../data/loafs';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modal'
import Share from 'react-native-share';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import ModalDropdown from 'react-native-modal-dropdown';
import AwesomeButton from 'react-native-really-awesome-button';

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
  await this.buildLoafs();
}

  public componentWillUnmount() {
    this.setState({loading:false})
  }


    public render() {
        return (
          <View>
            {/* <Modal 
              isVisible={this.state.loading && this.state.loafs.length===0}
              onBackButtonPress={() => {
                this.setState({loading:false})
                this.props.navigation.navigate('Main')}}
              coverScreen={false}
            >
              <ActivityIndicator size='large' style={{alignSelf:'center'}} color='white'></ActivityIndicator>
            </Modal> */}
            <FlatList
              data={this.state.loafs}
              ListHeaderComponentStyle={{zIndex: 999}}
              ListHeaderComponent={
              <ModalDropdown
                style={{alignSelf: 'center', width: '60%', height:35, 
                  marginTop: 12, 
                  marginBottom: this.state.loading && this.state.loafs.length===0 ? 12 : 0,
                  justifyContent:'center', backgroundColor:'white'

                 }}
                options={['Newest', 'Top Today', 'Top This Week', 'Top All Time']}
                dropdownStyle={{alignSelf: 'center',width:'60%', height:150}}
                dropdown
                onSelect={(idx, value) => this.handleChangeSortMethod(value)}
                defaultValue="Newest"
                dropdownTextStyle={[styles.buttonTitleStyle,{alignSelf: 'center', fontSize: 14}]}
                textStyle={[styles.buttonTitleStyle,{alignSelf: 'center', fontSize: 14}]}
                animated={true}

                
              />
              }
              ListFooterComponent={
                this.state.loading && this.state.loafs.length ==0 ?
                <View style={{justifyContent:'center', alignItems: 'center'}}>
                  <ActivityIndicator size='large'  style={{alignSelf:'center'}}></ActivityIndicator>
                </View> :
                <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', marginTop: this.state.loading ? 0 : 12}}>
                  <Button buttonStyle={styles.buttonStyle} titleStyle={styles.buttonTitleStyle} disabled={!this.state.moreToLoad || this.state.loading}
                    onPress={this.handleNext}  title="Next" iconRight={true} 
                    icon={
                      this.state.startAt && this.state.loafs.length>0 && 
                      this.state.loading && 
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
                      <AwesomeButton
                        backgroundColor={this.state.loafs[item.index].liked ? '#e3e6e8' : '#1b8bd5'}
                        backgroundDarker={this.state.loafs[item.index].liked ? '#a7a7a8' : '#144a6b'}
                        backgroundShadow={this.state.loafs[item.index].liked ? '#a7a7a8' : '#144a6b'}
                        disabled={this.state.loafs[item.index].liked}
                        width={110} height={40} borderRadius={8}
                        onPress={() => this.handleLike(item.item.id, item.index)}
                        style={{alignSelf:'center',margin:8, justifyContent:'center', alignItems: 'center'}}
                        >  
                          <Icon style={{left:0, marginRight: 12 }} name='thumbs-o-up' size={20} color='white'/>
                          <Text style={{fontSize: 18, fontFamily: 'Nathaniel19-Regular', color:'white'}}>
                            {item.item.liked ? (item.item.score+1).toString() : item.item.score.toString()}
                          </Text>
                      </AwesomeButton>
                      <AwesomeButton
                        textFontFamily='Nathaniel19-Regular' textSize={18}
                        backgroundColor='#1b8bd5'
                        backgroundDarker='#144a6b'
                        backgroundShadow='#144a6b'
                        width={110} height={40} borderRadius={8}
                        onPress={() => this.handleShare(item.index)}
                        style={{alignSelf:'center',margin:8, justifyContent:'center', alignItems: 'center'}}
                        >
                          Share
                      </AwesomeButton>
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
      const startingSortingMode = this.state.sortingMode;
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
          let today : Date = new Date();
          today.setHours(0,0,0,0);
          loafs = this.state.startAt ? await (await getLoafs()).where('loaf.day', '==', today).orderBy('loaf.score', 'desc').startAfter(this.state.startAt).limit(this.state.loafCount).get() :
            await (await getLoafs()).where('loaf.day', '==', today).orderBy('loaf.score', 'desc').limit(this.state.loafCount).get();
          break;
        case('Top This Week') : 
          let week : Date = new Date();
          week.setHours(0,0,0,0);
          var day = week.getDay()
          var diff = week.getDate() - day  + (day == 0 ? -6:1)
          var weekstart = new Date(week.setDate(diff));
          loafs = this.state.startAt ? await (await getLoafs()).where('loaf.week', '==', weekstart).orderBy('loaf.score', 'desc').startAfter(this.state.startAt).limit(this.state.loafCount).get() :
            await (await getLoafs()).where('loaf.week', '==', weekstart).orderBy('loaf.score', 'desc').limit(this.state.loafCount).get();
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
      if (startingSortingMode === this.state.sortingMode) {
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
      }
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