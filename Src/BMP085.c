// I2Cdev library collection - BMP085 I2C device class
// Based on register information stored in the I2Cdevlib internal database
// 2012-06-28 by Jeff Rowberg <jeff@rowberg.net>
// Updates should (hopefully) always be available at https://github.com/jrowberg/i2cdevlib
// 2015-06-06 by Andrey Voloshin <voloshin@think.in.ua>
//
// Changelog:
//     2015-06-06 - ported to STM32 HAL library from Arduino code

/* ============================================
I2Cdev device library code is placed under the MIT license
Copyright (c) 2012 Jeff Rowberg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
===============================================
*/

#include "BMP085.h"



static uint8_t devAddr = BMP085_DEFAULT_ADDRESS;
static uint8_t buffer[3];

static bool calibrationLoaded;
static int16_t ac1, ac2, ac3, b1, b2, mb, mc, md;
static uint16_t ac4, ac5, ac6;
static int32_t b5;
static uint8_t measureMode;

/**
 * Specific address constructor.
 * @param address Specific device address
 * @see BMP085_DEFAULT_ADDRESS
 */
void BMP085_setAddress(uint8_t address)
{
    devAddr = address;
}

/**
 * Prepare device for normal usage.
 */
void BMP085_initialize()
{
    if (devAddr==0) devAddr = BMP085_DEFAULT_ADDRESS;
    // load sensor's calibration constants
    BMP085_loadCalibration();
}

/**
 * Verify the device is connected and available.
 */
bool BMP085_testConnection()
{
    // test for a response, though this is very basic
    return I2Cdev_readByte(devAddr, BMP085_RA_AC1_H, buffer, 100) == 1;
}

/* calibration register methods */

void BMP085_loadCalibration()
{
    uint8_t buf2[22];
    I2Cdev_readBytes(devAddr, BMP085_RA_AC1_H, 22, buf2, 1000);
    ac1 = ((int16_t)buf2[0] << 8) + buf2[1];
    ac2 = ((int16_t)buf2[2] << 8) + buf2[3];
    ac3 = ((int16_t)buf2[4] << 8) + buf2[5];
    ac4 = ((uint16_t)buf2[6] << 8) + buf2[7];
    ac5 = ((uint16_t)buf2[8] << 8) + buf2[9];
    ac6 = ((uint16_t)buf2[10] << 8) + buf2[11];
    b1 = ((int16_t)buf2[12] << 8) + buf2[13];
    b2 = ((int16_t)buf2[14] << 8) + buf2[15];
    mb = ((int16_t)buf2[16] << 8) + buf2[17];
    mc = ((int16_t)buf2[18] << 8) + buf2[19];
    md = ((int16_t)buf2[20] << 8) + buf2[21];
    calibrationLoaded = true;
}

#ifdef BMP085_INCLUDE_INDIVIDUAL_CALIBRATION_ACCESS
int16_t BMP085_getAC1()
{
    if (calibrationLoaded) return ac1;
    I2Cdev_readBytes(devAddr, BMP085_RA_AC1_H, 2, buffer);
    return ((int16_t)buffer[1] << 8) + buffer[0];
}

int16_t BMP085_getAC2()
{
    if (calibrationLoaded) return ac2;
    I2Cdev_readBytes(devAddr, BMP085_RA_AC2_H, 2, buffer);
    return ((int16_t)buffer[1] << 8) + buffer[0];
}

int16_t BMP085_getAC3()
{
    if (calibrationLoaded) return ac3;
    I2Cdev_readBytes(devAddr, BMP085_RA_AC3_H, 2, buffer);
    return ((int16_t)buffer[1] << 8) + buffer[0];
}

uint16_t BMP085_getAC4()
{
    if (calibrationLoaded) return ac4;
    I2Cdev_readBytes(devAddr, BMP085_RA_AC4_H, 2, buffer);
    return ((uint16_t)buffer[1] << 8) + buffer[0];
}

uint16_t BMP085_getAC5()
{
    if (calibrationLoaded) return ac5;
    I2Cdev_readBytes(devAddr, BMP085_RA_AC5_H, 2, buffer);
    return ((uint16_t)buffer[1] << 8) + buffer[0];
}

uint16_t BMP085_getAC6()
{
    if (calibrationLoaded) return ac6;
    I2Cdev_readBytes(devAddr, BMP085_RA_AC6_H, 2, buffer);
    return ((uint16_t)buffer[1] << 8) + buffer[0];
}

int16_t BMP085_getB1()
{
    if (calibrationLoaded) return b1;
    I2Cdev_readBytes(devAddr, BMP085_RA_B1_H, 2, buffer);
    return ((int16_t)buffer[1] << 8) + buffer[0];
}

int16_t BMP085_getB2()
{
    if (calibrationLoaded) return b2;
    I2Cdev_readBytes(devAddr, BMP085_RA_B2_H, 2, buffer);
    return ((int16_t)buffer[1] << 8) + buffer[0];
}

int16_t BMP085_getMB()
{
    if (calibrationLoaded) return mb;
    I2Cdev_readBytes(devAddr, BMP085_RA_MB_H, 2, buffer);
    return ((int16_t)buffer[1] << 8) + buffer[0];
}

int16_t BMP085_getMC()
{
    if (calibrationLoaded) return mc;
    I2Cdev_readBytes(devAddr, BMP085_RA_MC_H, 2, buffer);
    return ((int16_t)buffer[1] << 8) + buffer[0];
}

int16_t BMP085_getMD()
{
    if (calibrationLoaded) return md;
    I2Cdev_readBytes(devAddr, BMP085_RA_MD_H, 2, buffer);
    return ((int16_t)buffer[1] << 8) + buffer[0];
}
#endif

/* control register methods */

uint8_t BMP085_getControl()
{
    I2Cdev_readByte(devAddr, BMP085_RA_CONTROL, buffer, 1000);
    return buffer[0];
}
void BMP085_setControl(uint8_t value)
{
    I2Cdev_writeByte(devAddr, BMP085_RA_CONTROL, value);
    measureMode = value;
}

/* measurement register methods */

uint16_t BMP085_getMeasurement2()
{
    I2Cdev_readBytes(devAddr, BMP085_RA_MSB, 2, buffer, 1000);
    return ((uint16_t) buffer[0] << 8) + buffer[1];
}
uint32_t BMP085_getMeasurement3()
{
    I2Cdev_readBytes(devAddr, BMP085_RA_MSB, 3, buffer, 1000);
    return ((uint32_t)buffer[0] << 16) + ((uint16_t)buffer[1] << 8) + buffer[2];
}
uint8_t BMP085_getMeasureDelayMilliseconds(uint8_t mode)
{
    if (mode == 0) mode = measureMode;
    if (measureMode == 0x2E) return 5;
    else if (measureMode == 0x34) return 5;
    else if (measureMode == 0x74) return 8;
    else if (measureMode == 0xB4) return 14;
    else if (measureMode == 0xF4) return 26;
    return 0; // invalid mode
}
uint16_t BMP085_getMeasureDelayMicroseconds(uint8_t mode)
{
    if (mode == 0) mode = measureMode;
    if (measureMode == 0x2E) return 4500;
    else if (measureMode == 0x34) return 4500;
    else if (measureMode == 0x74) return 7500;
    else if (measureMode == 0xB4) return 13500;
    else if (measureMode == 0xF4) return 25500;
    return 0; // invalid mode
}

uint16_t BMP085_getRawTemperature()
{
    if (measureMode == 0x2E) return BMP085_getMeasurement2();
    return 0; // wrong measurement mode for temperature request
}

float BMP085_getTemperatureC()
{
    /*
    Datasheet formula:
        UT = raw temperature
        X1 = (UT - AC6) * AC5 / 2^15
        X2 = MC * 2^11 / (X1 + MD)
        B5 = X1 + X2
        T = (B5 + 8) / 2^4
    */
    int32_t ut = BMP085_getRawTemperature();
    int32_t x1 = ((ut - (int32_t)ac6) * (int32_t)ac5) >> 15;
    int32_t x2 = ((int32_t)mc << 11) / (x1 + md);
    b5 = x1 + x2;
    return (float)((b5 + 8) >> 4) / 10.0f;
}

float BMP085_getTemperatureF()
{
    return BMP085_getTemperatureC() * 9.0f / 5.0f + 32;
}

uint32_t BMP085_getRawPressure()
{
    if (measureMode & 0x34) return BMP085_getMeasurement3() >> (8 - ((measureMode & 0xC0) >> 6));
    return 0; // wrong measurement mode for pressure request
}

float BMP085_getPressure()
{
    /*
    Datasheet forumla
        UP = raw pressure
        B6 = B5 - 4000
        X1 = (B2 * (B6 * B6 / 2^12)) / 2^11
        X2 = AC2 * B6 / 2^11
        X3 = X1 + X2
        B3 = ((AC1 * 4 + X3) << oss + 2) / 4
        X1 = AC3 * B6 / 2^13
        X2 = (B1 * (B6 * B6 / 2^12)) / 2^16
        X3 = ((X1 + X2) + 2) / 2^2
        B4 = AC4 * (unsigned long)(X3 + 32768) / 2^15
        B7 = ((unsigned long)UP - B3) * (50000 >> oss)
        if (B7 < 0x80000000) { p = (B7 * 2) / B4 }
        else { p = (B7 / B4) * 2 }
        X1 = (p / 2^8) * (p / 2^8)
        X1 = (X1 * 3038) / 2^16
        X2 = (-7357 * p) / 2^16
        p = p + (X1 + X2 + 3791) / 2^4
    */
    uint32_t up = BMP085_getRawPressure();
    uint8_t oss = (measureMode & 0xC0) >> 6;
    int32_t p;
    int32_t b6 = b5 - 4000;
    int32_t x1 = ((int32_t)b2 * ((b6 * b6) >> 12)) >> 11;
    int32_t x2 = ((int32_t)ac2 * b6) >> 11;
    int32_t x3 = x1 + x2;
    int32_t b3 = ((((int32_t)ac1 * 4 + x3) << oss) + 2) >> 2;
    x1 = ((int32_t)ac3 * b6) >> 13;
    x2 = ((int32_t)b1 * ((b6 * b6) >> 12)) >> 16;
    x3 = ((x1 + x2) + 2) >> 2;
    uint32_t b4 = ((uint32_t)ac4 * (uint32_t)(x3 + 32768)) >> 15;
    uint32_t b7 = ((uint32_t)up - b3) * (uint32_t)(50000UL >> oss);
    if (b7 < 0x80000000)
    {
        p = (b7 << 1) / b4;
    }
    else
    {
        p = (b7 / b4) << 1;
    }
    x1 = (p >> 8) * (p >> 8);
    x1 = (x1 * 3038) >> 16;
    x2 = (-7357 * p) >> 16;
    return p + ((x1 + x2 + (int32_t)3791) >> 4);
}

float BMP085_getAltitude(float pressure, float seaLevelPressure)
{
    if (seaLevelPressure == 0) seaLevelPressure = 101325;
    return 44330 * (1.0 - pow(pressure / seaLevelPressure, 0.1903));
}

float GroundAltitude() {
	float t,a,p;
	uint16_t i;
	
	BMP085_setControl(BMP085_MODE_TEMPERATURE);
	HAL_Delay(BMP085_getMeasureDelayMilliseconds(BMP085_MODE_TEMPERATURE));
	t = BMP085_getTemperatureC();
	
	HAL_Delay(10);
	
	HAL_GPIO_TogglePin(LED_GPIO_Port, LED_Pin);
	
	BMP085_setControl(BMP085_MODE_PRESSURE_3);
	HAL_Delay(BMP085_getMeasureDelayMilliseconds(BMP085_MODE_PRESSURE_3));
	p = BMP085_getPressure();
	
	a = BMP085_getAltitude(p, 101325);
	
	for (i = 0; i < 100; i++) { 
		HAL_Delay(1);
		
		BMP085_setControl(BMP085_MODE_TEMPERATURE);
    HAL_Delay(BMP085_getMeasureDelayMilliseconds(BMP085_MODE_TEMPERATURE));
    t = BMP085_getTemperatureC();
		
		HAL_Delay(1);
		
		HAL_GPIO_TogglePin(LED_GPIO_Port, LED_Pin);
		
		BMP085_setControl(BMP085_MODE_PRESSURE_3);
		HAL_Delay(BMP085_getMeasureDelayMilliseconds(BMP085_MODE_PRESSURE_3));
		p = BMP085_getPressure();
		
		a = (0.05 * BMP085_getAltitude(p, 101325)) + ((1 - 0.05) * a);
	}
	
	
	return a;
}

//I2C

uint8_t I2Cdev_readBytes(uint8_t devAddr, uint8_t regAddr, uint8_t length, uint8_t *data, uint16_t timeout){
    uint16_t tout = timeout > 0 ? timeout : I2CDEV_DEFAULT_READ_TIMEOUT;

    HAL_I2C_Master_Transmit(&hi2c1, devAddr << 1, &regAddr, 1, tout);
    if (HAL_I2C_Master_Receive(&hi2c1, devAddr << 1, data, length, tout) == HAL_OK) return length;
    return -1;
}

uint8_t I2Cdev_readByte(uint8_t devAddr, uint8_t regAddr, uint8_t *data, uint16_t timeout){
    return I2Cdev_readBytes(devAddr, regAddr, 1, data, timeout);
}


uint16_t I2Cdev_writeBytes(uint8_t devAddr, uint8_t regAddr, uint8_t length, uint8_t* pData){
    HAL_StatusTypeDef status = HAL_I2C_Mem_Write(&hi2c1, devAddr << 1, regAddr, I2C_MEMADD_SIZE_8BIT, pData, length, 1000);
    return status == HAL_OK;
}

uint16_t I2Cdev_writeByte(uint8_t devAddr, uint8_t regAddr, uint8_t data){
    return I2Cdev_writeBytes(devAddr, regAddr, 1, &data);
}

