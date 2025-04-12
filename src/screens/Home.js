import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';

const { width } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = width - 30; // 15px padding on each side
const AUTO_SCROLL_INTERVAL = 4000; // 4 seconds

const Home = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isManualScroll, setIsManualScroll] = useState(false);
  const scrollViewRef = useRef(null);
  const timerRef = useRef(null);
  const navigation = useNavigation();

  // Carousel images from the carousel folder
  const carouselImages = [
    require('../../assets/carousel/image1.jpg'),
    require('../../assets/carousel/image2.jpg'),
    require('../../assets/carousel/image3.jpg'),
    require('../../assets/carousel/image4.jpg'),
    require('../../assets/carousel/image5.jpg'),
    require('../../assets/carousel/image6.jpg'),
    require('../../assets/carousel/image7.jpg'),
    require('../../assets/carousel/image8.jpg'),
  ];

  // Auto scroll carousel
  useEffect(() => {
    startAutoScroll();
    
    return () => {
      // Clean up timer when component unmounts
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeSlide]);

  // Restart auto-scroll after manual scrolling stops
  useEffect(() => {
    if (isManualScroll) {
      const resumeTimer = setTimeout(() => {
        setIsManualScroll(false);
        startAutoScroll();
      }, 5000); // Resume auto-scroll after 5 seconds of inactivity
      
      return () => clearTimeout(resumeTimer);
    }
  }, [isManualScroll]);

  const startAutoScroll = () => {
    // Clear existing timer if any
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set up new interval
    timerRef.current = setInterval(() => {
      if (!isManualScroll && scrollViewRef.current) {
        const nextSlide = (activeSlide + 1) % carouselImages.length;
        setActiveSlide(nextSlide);
        scrollViewRef.current.scrollTo({
          x: nextSlide * CAROUSEL_ITEM_WIDTH,
          animated: true,
        });
      }
    }, AUTO_SCROLL_INTERVAL);
  };

  const handleScrollBegin = () => {
    setIsManualScroll(true);
    // Stop auto-scrolling when user interacts
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleScroll = (event) => {
    if (isManualScroll) {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const index = Math.round(scrollPosition / CAROUSEL_ITEM_WIDTH);
      if (index !== activeSlide) {
        setActiveSlide(index);
      }
    }
  };

  const BRANDS = [
    { label: "All", value: "" },
    { label: "Shinko", value: "Shinko" },
    { label: "Pirelli", value: "Pirelli" },
    { label: "Motozo", value: "Motozo" },
    { label: "Eurogrip", value: "Eurogrip" },
    { label: "Michelin", value: "Michelin" },
  ];

  const brands = [
    { name: 'Shinko Tires', value: 'Shinko', image: require('../../assets/shinko.png') },
    { name: 'Pirelli Tires', value: 'Pirelli', image: require('../../assets/pirelli.png') },
    { name: 'Michelin Tires', value: 'Michelin', image: require('../../assets/michelin.jpg') },
    { name: 'Eurogrip', value: 'Eurogrip', image: require('../../assets/eurogrip.png') },
    { name: 'Motoz', value: 'Motozo', image: require('../../assets/motoz.jpg') },
  ];

  const handleNavigateToBrand = (id) => {
    navigation.navigate('CategoriesTab', {payload: id})
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header title="KidManila" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section - Moved to top */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to KidManila</Text>
          <Text style={styles.welcomeText}>
            Your one-stop shop for premium motorcycle tires
          </Text>
        </View>

        {/* Carousel Section */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            onScrollBeginDrag={handleScrollBegin}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={CAROUSEL_ITEM_WIDTH}
            snapToAlignment="center"
            contentContainerStyle={styles.carouselScrollContent}
          >
            {carouselImages.map((image, index) => (
              <View key={index} style={styles.carouselItem}>
                <Image
                  source={image}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
          
          {/* Pagination dots */}
          <View style={styles.paginationContainer}>
            {carouselImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeSlide ? styles.paginationDotActive : styles.paginationDotInactive
                ]}
              />
            ))}
          </View>
        </View>

        {/* Tire Brands Section - Updated Styling */}
        <View style={styles.brandsSection}>
          <Text style={styles.sectionTitle}>Tire Brands</Text>
          <ScrollView 
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.brandsScroll}
          >
            {brands.map((brand, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.brandCard}
                onPress={() => handleNavigateToBrand(brand.value)}
              >
                <View style={styles.brandImageContainer}>
                  <Image 
                    source={brand.image} 
                    style={styles.brandImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.brandName}>{brand.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products Section */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <View style={styles.emptyFeaturedContainer}>
            <Text style={styles.emptyText}>No featured products available yet</Text>
          </View>
        </View>

        {/* Book a Service Section */}
        <Text style={styles.sectionTitle}>Book a Service</Text>
        <TouchableOpacity 
          style={styles.serviceSection}
          onPress={() => navigation.navigate('AppointmentTab')}
        >
          <Image 
            source={require('../../assets/carousel/image2.jpg')}
            style={styles.serviceBackground}
            resizeMode="cover"
          />
          <View style={styles.serviceOverlay} />
          <View style={styles.serviceTextContainer}>
            <Text style={styles.serviceTitle}>Professional Installation</Text>
            <Text style={styles.serviceText}>Book an appointment today</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    padding: 15,
  },
  // Carousel styles
  carouselContainer: {
    marginBottom: 20,
  },
  carouselScrollContent: {
    paddingBottom: 10,
  },
  carouselItem: {
    width: CAROUSEL_ITEM_WIDTH,
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: '#1e1e1e',
  },
  paginationDotInactive: {
    backgroundColor: '#ccc',
  },
  welcomeSection: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  welcomeTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  welcomeText: {
    color: '#ddd',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  brandsSection: {
    marginBottom: 20,
  },
  brandsScroll: {
    paddingBottom: 5,
  },
  brandCard: {
    width: 110,
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  brandImageContainer: {
    width: 90,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandImage: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 12,
    textAlign: 'center',
  },
  serviceSection: {
    height: 180,
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  serviceBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  serviceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  serviceTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  serviceText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  featuredSection: {
    marginBottom: 20,
  },
  emptyFeaturedContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default Home; 