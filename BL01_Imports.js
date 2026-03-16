import React,{useState,useEffect,useCallback,useMemo,useRef}from 'react';
import{View,Text,TextInput,TouchableOpacity,FlatList,Modal,Alert,ScrollView,StatusBar,Dimensions,Platform,KeyboardAvoidingView}from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
export{React,useState,useEffect,useCallback,useMemo,useRef,View,Text,TextInput,TouchableOpacity,FlatList,Modal,Alert,ScrollView,StatusBar,Dimensions,Platform,KeyboardAvoidingView,AsyncStorage,DocumentPicker,Icon,useSafeAreaInsets,ScreenOrientation};