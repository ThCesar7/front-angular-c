import { Component, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class AppComponent {
  productDialog: boolean = false;
  submitted: boolean = false;
  products!: any[];
  gridData: any = {}
  selectedProducts!: any[] | null;
  @ViewChild('dt') dt: Table | undefined;
  token = '';

  instrucaoparticipante: any[] = []
  parentesco: any[] = []
  tipoDependente: any[] = []
  estadoCivil: any[] = []

  constructor(
    public service: AppService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,) {}

  ngOnInit() {
    this.service.get().subscribe(data => {
      console.error('data', data)
      this.products = data;
    }, (error) => {
      console.error('Erro ao buscar cadastro:', error);
      console.error('Detalhes do erro:', error.message);
    });
  }

  openNew() {
    this.gridData = {};
    this.submitted = false;
    this.productDialog = true;
  }

  editProduct(product: any) {
    this.gridData = { ...product };
    this.productDialog = true;
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  saveProduct() {
    this.submitted = true;

    if (this.gridData.nome?.trim()) {
      if (this.gridData.id) {
        const index = this.findIndexById(this.gridData.id);
        if (index !== -1) {
          // Atualizar a lista local
          this.products[index] = { ...this.gridData };

          // Chamar o método para atualizar no back-end
          console.log('Atualizando no back-end. Dados:', this.gridData);
          this.atualizar(this.gridData.id, this.gridData);

          // Fechar o diálogo
          this.productDialog = false;

          // Exibir mensagem de sucesso
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Atualizado', life: 3000 });
        } else {
          console.error('Produto não encontrado com ID:', this.gridData.id);
        }
      } else {
        // ID nulo, é um novo produto
        this.service.inserir(this.gridData).subscribe({
          next: (response: any) => {
            // O backend deve retornar o produto com o ID gerado
            this.products = this.products || [];
            this.products.push(response);

            // Fechar o diálogo
            this.productDialog = false;

            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto adicionado', life: 3000 });
          },
          error: (err: any) => {
            console.log('Erro ao inserir', err);
          }
        });
      }

      this.products = [...this.products];
      this.gridData = {};
    }
  }

  atualizar(id: number, dadosAtualizados: any) {
    this.productDialog = true;

    this.service.editar(id, dadosAtualizados).subscribe({
      next: () => {
        console.log('Atualizado com sucesso');
      },
      error: (err: any) => {
        console.log('Erro ao atualizar cadastro', err);
      },
    });
  }

  findIndexById(id: string): number {
    if (this.products) {
      return this.products.findIndex((product) => product.id === id);
    } else {
      console.error('A matriz de produtos é indefinida.');
      return -1;
    }
  }

  createId(): string {
    let id = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  onInputChange(event: any): void {
    const inputValue = (event.target as HTMLInputElement)?.value;
    this.dt?.filterGlobal(inputValue, 'contains');
  }

  deleteProduct(product: any) {
    this.confirmationService.confirm({
      message: 'Tem certeza de que deseja excluir?',
      header: 'Confirmar Exclusão?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.service.delete(product.id).subscribe(
          () => {
            this.products = this.products.filter((val) => val.id !== product.id);
            this.gridData = {};
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Cadastro excluído',
              life: 3000,
            });
          },
          (error) => {
            console.error('Erro ao excluir:', error);
          }
        );
      },
    });
  }
}
