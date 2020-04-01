import Resto from "../models/resto";
import { MongoClient, Db } from "mongodb";
import { ROOT_URL, ROOT_DB_NAME } from "../config/mongodb";

interface ReturnVal {
	score: number;
	count: number;
	name?: string;
	borough?: string;
	avg?: number;
}


export default class RestoManager {

	client: MongoClient;
	db: Db;

	constructor() {
		this.client = new MongoClient(ROOT_URL, { useUnifiedTopology: true });
	}

	async getTopFive(): Promise<Resto[]>
	{
		await this.connect();
		const collection = this.db.collection("restaurants");

		const borough = await collection.distinct("borough");
        
        let top = [];
        
        // Le map permet d'émettre pour chaque restaurant tous les scores.
        // DOnc pour chaque resto tu auras autant d'émission que de score.
        // Note que c'est le reducer qui traitera les données qui sont ici émises
        const mapB = function (this: Resto) {
            for(let i = 0 ; i < this.grades.length ; i++){
                if( this.grades[i].score ){
                    emit( this.restaurant_id , { 
                        score : this.grades[i].score, 
                        count : 1,
                        name : this.name,
                        borough : this.borough
                    });
                }
            }
        }
        
        // Le reduce récupère chaque donnée émis et aggrégées par id de restaurant voir le map
        // la méthode finalize permet plus bas de faire le calcul de la moyenne
        const reduceB = function (k: any, countObjVals: ReturnVal[]){
            let reduceVal: ReturnVal = { score : 0, count : 0 };
            
            for(let i = 0; i < countObjVals.length; i++){
                reduceVal.borough = countObjVals[i].borough;
                reduceVal.count += countObjVals[i].count;
                reduceVal.score += countObjVals[i].score;
                reduceVal.name = countObjVals[i].name;
            }
            
            return  reduceVal;
        }
        
        const finalizeB = function (k: any, reduceVal: ReturnVal)  {
            reduceVal.avg = Math.floor( 10 * ( reduceVal.score/reduceVal.count ) / 10 ) ;
            
            return reduceVal;
        }
        
        for( const b of borough){
            console.log('ici', b)
            const  cursor = await collection.mapReduce(
                mapB,
                reduceB,
                {
                    query : {  
                        cuisine : "Italian",
                        borough : b
                    } ,
                    out: { inline: 1 },
                    finalize : finalizeB
                }
			);
                
			// ici on ordonne et on slice les 5 meilleurs restos
			top.push(cursor.sort((a: ReturnVal, b: ReturnVal) => a.avg - b.avg < 0).slice(0,5))
		}
            
		return top;
	}


	private async connect(): Promise<void>
	{
		this.client = await this.client.connect();
		this.db = this.client.db(ROOT_DB_NAME);
	}

}