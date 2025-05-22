import { initializeDataBase } from "@/database/initializeDataBase";
import { Slot } from "expo-router"; 
import {SQLiteProvider} from 'expo-sqlite'

export default function Layout(){
    return(
        <SQLiteProvider databaseName="myDataBase.db" onInit={initializeDataBase}>
            <Slot/>
        </SQLiteProvider>
    )
}