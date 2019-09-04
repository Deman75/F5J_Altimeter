#include "iflash.h"

//========================= ¬нутр€нн€€ пам€ть ======================//
//data - указатель на записываемые данные
//address - адрес во flash
void Internal_Flash_Write(uint16_t data, unsigned int address) {
	
	FLASH_EraseInitTypeDef Flash_erase;
	HAL_StatusTypeDef Return_erase=NULL;
	HAL_StatusTypeDef	flash_ok = HAL_ERROR;
	
	uint32_t Error=0;
	
	Flash_erase.TypeErase=FLASH_TYPEERASE_PAGES;
	Flash_erase.PageAddress=address;
	Flash_erase.Banks=FLASH_BANK_1;
	Flash_erase.NbPages=1;

	// erase sector and write ystavok, bank 127 c adress
	// 0x0801FC00 - 0x0801FFFF
	flash_ok = HAL_ERROR;
	while(flash_ok != HAL_OK){
		flash_ok = HAL_FLASH_Unlock();
	}
	
	if (HAL_FLASHEx_Erase(&Flash_erase, &Error) != HAL_OK) 
	{     
		Return_erase=HAL_FLASH_Lock();
	}
	
	flash_ok = HAL_ERROR;
	while(flash_ok != HAL_OK){
		flash_ok = HAL_FLASH_Program(FLASH_TYPEPROGRAM_HALFWORD, address, data);
	}
}

uint16_t  Internal_Flash_Read(uint32_t addr)
{
	return (*(__IO uint32_t*) addr);
}