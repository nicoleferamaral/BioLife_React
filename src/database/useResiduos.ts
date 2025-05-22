import {useSQLiteContext} from 'expo-sqlite';
import { format } from 'date-fns';

export type Residuos = {
    id: number
    data: Date
    categoria: string
    peso: number
} // criando local de variaveis do banco

export function useResiduos(){
    const database = useSQLiteContext()  //acessar todos os métodos do bd

    async function create(data: Omit<Residuos, "id">) {
        const statement  = await database.prepareAsync(
            "INSERT INTO residuo (data, categoria, peso) VALUES ($data, $categoria, $peso)"
        ) // interpolação

        try{
            const formattedDate = format(data.data, 'yyyy-MM-dd');
            const result = await statement.executeAsync({
                $data: formattedDate,
                $categoria: data.categoria,
                $peso: data.peso
            })

            //coletando o ultimo id cadastrado e mostrando
            return{ insertedRowId: result.lastInsertRowId.toString() }

        }catch(error){
            console.error('Erro ao criar registro:', error);
            throw new Error('Não foi possível criar o registro');
        } finally{
                await statement.finalizeAsync()
        }// para encerrar o programa
        
    } //fim do create

    async function consultar(data?: string) {
        try {
            let query = "SELECT * FROM residuo";
            let params: string[] = [];

            if (data) {
                query += " WHERE data = ?";
                params.push(data);
            }

            query += " ORDER BY data DESC, id DESC";
            const response = await database.getAllAsync<Residuos>(query, params);
            return response.map(item => ({
                ...item,
                data: new Date(item.data)
            }));
        } catch (error) {
            console.error('Erro ao consultar registros:', error);
            throw new Error('Não foi possível consultar os registros');
        }
    }

    async function remove(id:number) {
        const statement = await database.prepareAsync(
            "DELETE FROM residuo WHERE id = $id"
        );

        try {
            await statement.executeAsync({ $id: id });
        } catch (error) {
            console.error('Erro ao remover registro:', error);
            throw new Error('Não foi possível remover o registro');
        } finally {
            await statement.finalizeAsync();
        }
    }

    async function atualizar(data: Residuos) {
        const statement = await database.prepareAsync(
            "UPDATE residuo SET data = $data, categoria = $categoria, peso = $peso WHERE id = $id"
        );

        try {
            const formattedDate = format(data.data, 'yyyy-MM-dd');
            await statement.executeAsync({
                $id: data.id,
                $data: formattedDate,
                $categoria: data.categoria,
                $peso: data.peso
            });
        } catch (error) {
            console.error('Erro ao atualizar registro:', error);
            throw new Error('Não foi possível atualizar o registro');
        } finally {
            await statement.finalizeAsync();
        }
    }

    return {create, consultar, remove, atualizar}
}// fim da function