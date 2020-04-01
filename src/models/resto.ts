import Address from "./address";
import Grade from "./grade";

export default class Resto {
	address: Address;
	borough: string;
	cuisine: string;
	name: string;
	restaurant_id: number;
	grades: Grade[];
}